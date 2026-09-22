// ==========================================================================
// useAudioQueue — Hook para gestionar cola de procesamiento de audio
// ==========================================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import type { AudioTrackItem, AudioSettings } from '../types/audioCleanup';
import AudioProcessorWorker from '../workers/audioProcessor.worker?worker';

interface UseAudioQueueReturn {
  tracks: AudioTrackItem[];
  selectedTrackId: string | null;
  activeModel: string;
  currentSettings: AudioSettings;
  isProcessing: boolean;
  queueLength: number;
  selectTrack: (id: string) => void;
  selectModel: (modelId: string) => void;
  updateSettings: (settings: Partial<AudioSettings>) => void;
  addTrack: (track: Omit<AudioTrackItem, 'status' | 'progress' | 'processedAudioBuffer' | 'selectedModel'>) => void;
  removeTrack: (id: string) => void;
  processTrack: (trackId: string) => Promise<void>;
  getProcessedBuffer: (trackId: string) => AudioBuffer | null;
}

export function useAudioQueue(): UseAudioQueueReturn {
  const [tracks, setTracks] = useState<AudioTrackItem[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [activeModel, setActiveModel] = useState<string>('rnnoise');
  const [currentSettings, setCurrentSettings] = useState<AudioSettings>({
    noiseReduction: 50,
    voiceGain: 0,
    thresholdSensitivity: 50,
    wetDryBalance: 100,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  
  const workerRef = useRef<AudioProcessorWorker | null>(null);
  const processingTrackIdRef = useRef<string | null>(null);

  // Initialize worker on mount
  useEffect(() => {
    workerRef.current = new AudioProcessorWorker();
    
    workerRef.current.onmessage = (e: MessageEvent) => {
      const { type, trackId, progress, result, sampleRate, channels, error } = e.data;
      
      if (type === 'progress') {
        // Update progress for the specific track
        setTracks(prev => prev.map(t => 
          t.id === trackId && t.status === 'processing' 
            ? { ...t, progress } 
            : t
        ));
      }
      
      if (type === 'complete') {
        // Create processed AudioBuffer
        const processedBuffer = createAudioBuffer(result, sampleRate, channels);
        
        setTracks(prev => prev.map(t => {
          if (t.id === trackId && t.rawAudioBuffer) {
            return {
              ...t,
              status: 'completed',
              progress: 100,
              processedAudioBuffer: processedBuffer,
            };
          }
          return t;
        }));
        
        processingTrackIdRef.current = null;
        setIsProcessing(false);
      }
      
      if (type === 'error') {
        setTracks(prev => prev.map(t =>
          t.id === trackId
            ? { ...t, status: 'error', progress: 0 }
            : t
        ));
        processingTrackIdRef.current = null;
        setIsProcessing(false);
      }
    };

    // Cleanup on unmount
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const selectTrack = useCallback((id: string) => {
    setSelectedTrackId(id);
  }, []);

  const selectModel = useCallback((modelId: string) => {
    setActiveModel(modelId);
  }, []);

  const updateSettings = useCallback((settings: Partial<AudioSettings>) => {
    setCurrentSettings(prev => ({ ...prev, ...settings }));
  }, []);

  const addTrack = useCallback((trackData: Omit<AudioTrackItem, 'status' | 'progress' | 'processedAudioBuffer' | 'selectedModel'>) => {
    const newTrack: AudioTrackItem = {
      ...trackData,
      status: 'idle',
      progress: 0,
      processedAudioBuffer: null,
      selectedModel: activeModel,
    };
    
    setTracks(prev => [...prev, newTrack]);
    
    // Auto-select the new track
    setSelectedTrackId(trackData.id);
  }, [activeModel]);

  const removeTrack = useCallback((id: string) => {
    setTracks(prev => prev.filter(t => t.id !== id));
    if (selectedTrackId === id) {
      setSelectedTrackId(null);
    }
  }, [selectedTrackId]);

  const processTrack = useCallback(async (trackId: string): Promise<void> => {
    const track = tracks.find(t => t.id === trackId);
    if (!track || !track.rawAudioBuffer || track.status === 'processing' || track.status === 'queued') {
      return;
    }

    // If already processing another track, queue this one
    if (isProcessing) {
      setTracks(prev => prev.map(t => 
        t.id === trackId ? { ...t, status: 'queued' } : t
      ));
      return;
    }

    // Start processing this track
    setIsProcessing(true);
    processingTrackIdRef.current = trackId;
    
    setTracks(prev => prev.map(t =>
      t.id === trackId ? { ...t, status: 'processing', progress: 0, selectedModel: activeModel } : t
    ));

    // Get audio data from buffer
    const channelData = track.rawAudioBuffer.getChannelData(0); // Use first channel
    const sampleRate = track.rawAudioBuffer.sampleRate;
    const numberOfChannels = track.rawAudioBuffer.numberOfChannels;

    // Send to worker
    workerRef.current?.postMessage({
      type: 'process',
      payload: {
        trackId,
        audioData: channelData,
        sampleRate,
        channels: numberOfChannels,
        modelId: activeModel,
        settings: currentSettings,
      },
    } as any);
  }, [tracks, isProcessing, activeModel, currentSettings]);

  const getProcessedBuffer = useCallback((trackId: string): AudioBuffer | null => {
    const track = tracks.find(t => t.id === trackId);
    return track?.processedAudioBuffer || null;
  }, [tracks]);

  const queueLength = tracks.filter(t => t.status === 'queued').length;

  return {
    tracks,
    selectedTrackId,
    activeModel,
    currentSettings,
    isProcessing,
    queueLength,
    selectTrack,
    selectModel,
    updateSettings,
    addTrack,
    removeTrack,
    processTrack,
    getProcessedBuffer,
  };
}

// Helper to create AudioBuffer from Float32Array
function createAudioBuffer(data: Float32Array, sampleRate: number, channels: number): AudioBuffer {
  const audioContext = new AudioContext();
  const buffer = audioContext.createBuffer(channels, data.length, sampleRate);
  
  for (let ch = 0; ch < channels; ch++) {
    buffer.getChannelData(ch).set(data);
  }
  
  return buffer;
}
