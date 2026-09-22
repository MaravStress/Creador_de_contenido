// ==========================================================================
// Audio Cleanup Module — Type Definitions
// ==========================================================================

export type AudioTrackStatus = 'idle' | 'queued' | 'processing' | 'completed' | 'error';

export interface AudioTrackItem {
  id: string;
  name: string;
  duration: number;
  originalType: 'audio' | 'video';
  rawAudioBuffer: AudioBuffer | null;
  processedAudioBuffer: AudioBuffer | null;
  status: AudioTrackStatus;
  progress: number; // 0-100
  selectedModel: string | null;
  settings: AudioSettings;
}

export interface AudioSettings {
  noiseReduction: number; // 0-100%
  voiceGain: number;      // -6dB to +12dB
  thresholdSensitivity: number; // 0-100%
  wetDryBalance: number;  // 0-100% (100 = fully processed)
}

export const DEFAULT_SETTINGS: AudioSettings = {
  noiseReduction: 50,
  voiceGain: 0,
  thresholdSensitivity: 50,
  wetDryBalance: 100,
};

export interface AudioModel {
  id: string;
  name: string;
  description: string;
  iconName: string;
  defaultSettings: Partial<AudioSettings>;
  options: string[]; // Slider names for this model
}

export const AUDIO_MODELS: AudioModel[] = [
  {
    id: 'rnnoise',
    name: 'RNNoise Quick Suppressor',
    description: 'Cancelación rápida de ruido constante (ventiladores, siseo, estática). Ligero y eficiente.',
    iconName: 'shield',
    defaultSettings: { noiseReduction: 70 },
    options: ['noiseReduction', 'voiceGain'],
  },
  {
    id: 'deepfilter',
    name: 'DeepFilterNet Studio',
    description: 'Alta fidelidad. Restaura armónicos y da calidad de estudio profesional a la voz.',
    iconName: 'mic',
    defaultSettings: { noiseReduction: 60, voiceGain: 3 },
    options: ['noiseReduction', 'voiceGain', 'wetDryBalance'],
  },
  {
    id: 'dereverb',
    name: 'Adaptive De-Reverb & Gate',
    description: 'Elimina eco de habitación y reverberación. Ideal para grabaciones caseras sin tratamiento acústico.',
    iconName: 'room',
    defaultSettings: { thresholdSensitivity: 40, noiseReduction: 30 },
    options: ['thresholdSensitivity', 'noiseReduction', 'voiceGain'],
  },
];
