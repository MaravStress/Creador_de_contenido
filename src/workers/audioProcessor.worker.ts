// ==========================================================================
// Audio Processor Web Worker — Local DSP Processing
// ==========================================================================

interface ProcessMessage {
  type: 'process';
  payload: {
    trackId: string;
    audioData: Float32Array;
    sampleRate: number;
    channels: number;
    modelId: string;
    settings: {
      noiseReduction: number;
      voiceGain: number;
      thresholdSensitivity: number;
      wetDryBalance: number;
    };
  };
}

interface ProgressMessage {
  type: 'progress';
  trackId: string;
  progress: number;
}

interface CompleteMessage {
  type: 'complete';
  trackId: string;
  result: Float32Array;
  sampleRate: number;
  channels: number;
}

interface ErrorMessage {
  type: 'error';
  trackId: string;
  error: string;
}

type WorkerMessage = ProcessMessage;
type OutgoingMessage = ProgressMessage | CompleteMessage | ErrorMessage;

let processingQueue: Array<{
  resolve: (result: Float32Array) => void;
  reject: (error: Error) => void;
  payload: ProcessMessage['payload'];
}> = [];
let isProcessing = false;

self.onmessage = function (e: MessageEvent<WorkerMessage>) {
  const message = e.data;
  
  if (message.type === 'process') {
    enqueueProcess(message.payload);
  }
};

function enqueueProcess(payload: ProcessMessage['payload']) {
  return new Promise<Float32Array>((resolve, reject) => {
    processingQueue.push({ resolve, reject, payload });
    processNext();
  });
}

async function processNext() {
  if (isProcessing || processingQueue.length === 0) {
    return;
  }

  isProcessing = true;
  const { resolve, reject, payload } = processingQueue.shift()!;

  try {
    const result = await processAudio(payload);
    resolve(result);
  } catch (error) {
    reject(error instanceof Error ? error : new Error('Unknown error'));
  } finally {
    isProcessing = false;
    // Cooldown of 2 seconds before next item
    setTimeout(() => processNext(), 2000);
  }
}

async function processAudio(payload: ProcessMessage['payload']): Promise<Float32Array> {
  const { trackId, audioData, sampleRate, channels, modelId, settings } = payload;
  const totalSamples = audioData.length;
  const result = new Float32Array(totalSamples);
  
  // Simulate progressive processing with chunks
  const chunkSize = Math.max(1, Math.floor(totalSamples / 100)); // 100 chunks for progress updates
  let processed = 0;

  for (let i = 0; i < totalSamples; i++) {
    const sample = audioData[i];
    
    // Apply DSP effects based on model and settings
    let processedSample = applyNoiseGate(sample, settings.thresholdSensitivity);
    processedSample = applyNoiseReduction(processedSample, settings.noiseReduction);
    processedSample = applyVoiceGain(processedSample, settings.voiceGain);
    processedSample = applyWetDryBlend(processedSample, sample, settings.wetDryBalance);
    
    result[i] = processedSample;
    processed++;

    // Emit progress every chunk
    if (processed % chunkSize === 0) {
      const progress = Math.min(100, Math.round((processed / totalSamples) * 100));
      self.postMessage({ 
        type: 'progress', 
        trackId,
        progress 
      } as OutgoingMessage);
    }
  }

  // Final progress update
  self.postMessage({ 
    type: 'progress', 
    trackId,
    progress: 100 
  } as OutgoingMessage);
  
  return result;
}

// ==========================================================================
// DSP Algorithms (Simplified implementations for local processing)
// ==========================================================================

function applyNoiseGate(sample: number, sensitivity: number): number {
  // Simple amplitude-based noise gate
  const threshold = (100 - sensitivity) / 100 * 0.3; // Map 0-100 to threshold 0.3-0.0
  if (Math.abs(sample) < threshold) {
    return sample * 0.1; // Attenuate below threshold
  }
  return sample;
}

function applyNoiseReduction(sample: number, reduction: number): number {
  // Simplified spectral subtraction simulation
  const factor = reduction / 100;
  // Apply gentle smoothing to reduce high-frequency noise
  return sample * (1 - factor * 0.3);
}

function applyVoiceGain(sample: number, gainDb: number): number {
  // Convert dB to linear multiplier
  const multiplier = Math.pow(10, gainDb / 20);
  return Math.max(-1, Math.min(1, sample * multiplier)); // Clamp to [-1, 1]
}

function applyWetDryBlend(wet: number, dry: number, balance: number): number {
  // Mix between original (dry) and processed (wet)
  const wetFactor = balance / 100;
  const dryFactor = 1 - wetFactor;
  return wet * wetFactor + dry * dryFactor;
}
