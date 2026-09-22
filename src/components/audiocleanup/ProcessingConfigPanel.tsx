// ==========================================================================
// ProcessingConfigPanel — Panel Derecho (80%)
// Selección de modelos IA, opciones de configuración, reproductor A/B y exportación
// ==========================================================================

import React, { useRef, useState, useEffect } from 'react';
import type { AudioTrackItem, AudioSettings } from '../../types/audioCleanup';
import { AUDIO_MODELS } from '../../types/audioCleanup';

interface ProcessingConfigPanelProps {
  tracks: AudioTrackItem[];
  selectedTrackId: string | null;
  activeModel: string;
  currentSettings: AudioSettings;
  isProcessing: boolean;
  onSelectModel: (modelId: string) => void;
  updateSettings: (settings: Partial<AudioSettings>) => void;
  processTrack: (trackId: string) => Promise<void>;
  getProcessedBuffer: (trackId: string) => AudioBuffer | null;
}

export const ProcessingConfigPanel: React.FC<ProcessingConfigPanelProps> = ({
  tracks,
  selectedTrackId,
  activeModel,
  currentSettings,
  isProcessing,
  onSelectModel,
  updateSettings,
  processTrack,
  getProcessedBuffer,
}) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playMode, setPlayMode] = useState<'original' | 'processed'>('original');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const animationFrameRef = useRef<number>(0);

  const selectedTrack = tracks.find(t => t.id === selectedTrackId);
  const activeModelData = AUDIO_MODELS.find(m => m.id === activeModel);

  // Initialize AudioContext
  if (!audioContextRef.current && typeof window !== 'undefined') {
    audioContextRef.current = new AudioContext();
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handlePlayPause = async () => {
    if (!selectedTrack || !audioContextRef.current) return;

    if (isPlaying) {
      // Stop playback
      audioContextRef.current.close();
      audioContextRef.current = new AudioContext();
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    try {
      const ctx = audioContextRef.current;
      
      // Get the appropriate buffer
      let buffer: AudioBuffer;
      if (playMode === 'processed' && selectedTrack.processedAudioBuffer) {
        buffer = selectedTrack.processedAudioBuffer;
      } else {
        buffer = selectedTrack.rawAudioBuffer!;
      }

      setDuration(buffer.duration);

      // Create buffer source
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();

      // Update time
      const startTime = ctx.currentTime;
      setIsPlaying(true);

      const updateTime = () => {
        setCurrentTime(ctx.currentTime - startTime);
        if (ctx.currentTime - startTime < buffer.duration) {
          animationFrameRef.current = requestAnimationFrame(updateTime);
        } else {
          setIsPlaying(false);
          setCurrentTime(0);
        }
      };
      animationFrameRef.current = requestAnimationFrame(updateTime);

      source.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProcess = async () => {
    if (selectedTrackId) {
      await processTrack(selectedTrackId);
    }
  };

  const handleExport = () => {
    if (!selectedTrack?.processedAudioBuffer) return;

    const buffer = selectedTrack.processedAudioBuffer;
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length;

    // Create WAV file
    const wavBitsPerSample = 16;
    const byteDepth = wavBitsPerSample / 8;
    const avgBytesPerSec = sampleRate * numChannels * byteDepth;
    const blockAlign = numChannels * byteDepth;
    const dataSize = length * numChannels * byteDepth;
    const bufferSize = 44 + dataSize;
    const bufferArray = new ArrayBuffer(bufferSize);
    const view = new DataView(bufferArray);

    // WAV header
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, avgBytesPerSec, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, wavBitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    // Write audio data
    let offset = 44;
    const channels: Float32Array[] = [];
    for (let ch = 0; ch < numChannels; ch++) {
      channels.push(buffer.getChannelData(ch));
    }

    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, channels[ch][i]));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
    }

    // Create blob and download
    const blob = new Blob([bufferArray], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTrack.name.replace(/\.[^/.]+$/, '')}_cleaned.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSettingChange = (key: keyof AudioSettings, value: number) => {
    updateSettings({ [key]: value });
  };

  if (!selectedTrack) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center h-100">
        <span
          className="material-symbols-outlined mb-3 fs-1"
          style={{ color: 'var(--text-tertiary)', opacity: 0.3 }}
        >
          graphic_eq
        </span>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
          Selecciona una pista para comenzar
        </p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column h-100 p-4" style={{ overflowY: 'auto' }}>
      {/* Section 1: Model Selection */}
      <div className="mb-4">
        <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', letterSpacing: '-0.01em' }}>
          Modelo de IA
        </h6>
        <div className="row g-3">
          {AUDIO_MODELS.map(model => (
            <div className="col-12 col-md-4" key={model.id}>
              <div
                onClick={() => onSelectModel(model.id)}
                className="glass-panel p-3 h-100 d-flex flex-column gap-2"
                style={{
                  cursor: 'pointer',
                  border: activeModel === model.id ? '1px solid rgba(10,132,255,0.5)' : '1px solid var(--glass-border)',
                  backgroundColor: activeModel === model.id ? 'rgba(10,132,255,0.1)' : 'var(--glass-bg)',
                  transition: 'all 0.2s var(--ease-apple)',
                }}
              >
                <div className="d-flex align-items-center gap-2">
                  <span className="material-symbols-outlined fs-5" style={{ color: activeModel === model.id ? 'var(--apple-blue)' : 'var(--text-secondary)' }}>
                    {model.iconName}
                  </span>
                  <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>{model.name}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                  {model.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: 'var(--glass-border)', margin: '0 0 1.5rem 0' }} />

      {/* Section 2: Configuration Options */}
      <div className="mb-4">
        <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', letterSpacing: '-0.01em' }}>
          Configuración
        </h6>
        
        <div className="d-flex flex-column gap-4">
          {activeModelData?.options.includes('noiseReduction') && (
            <div>
              <div className="d-flex justify-content-between mb-2">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Supresión de ruido
                </label>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{currentSettings.noiseReduction}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentSettings.noiseReduction}
                onChange={(e) => handleSettingChange('noiseReduction', parseInt(e.target.value))}
                className="form-range custom-range"
                style={{ accentColor: 'var(--apple-blue)' }}
              />
            </div>
          )}

          {activeModelData?.options.includes('voiceGain') && (
            <div>
              <div className="d-flex justify-content-between mb-2">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Ganancia de voz
                </label>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  {currentSettings.voiceGain >= 0 ? `+${currentSettings.voiceGain}` : currentSettings.voiceGain} dB
                </span>
              </div>
              <input
                type="range"
                min="-6"
                max="12"
                step="0.5"
                value={currentSettings.voiceGain}
                onChange={(e) => handleSettingChange('voiceGain', parseFloat(e.target.value))}
                className="form-range custom-range"
                style={{ accentColor: 'var(--apple-green)' }}
              />
            </div>
          )}

          {activeModelData?.options.includes('thresholdSensitivity') && (
            <div>
              <div className="d-flex justify-content-between mb-2">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Umbral de sensibilidad
                </label>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{currentSettings.thresholdSensitivity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentSettings.thresholdSensitivity}
                onChange={(e) => handleSettingChange('thresholdSensitivity', parseInt(e.target.value))}
                className="form-range custom-range"
                style={{ accentColor: 'var(--apple-purple)' }}
              />
            </div>
          )}

          {activeModelData?.options.includes('wetDryBalance') && (
            <div>
              <div className="d-flex justify-content-between mb-2">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Balance procesado
                </label>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{currentSettings.wetDryBalance}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentSettings.wetDryBalance}
                onChange={(e) => handleSettingChange('wetDryBalance', parseInt(e.target.value))}
                className="form-range custom-range"
                style={{ accentColor: 'var(--apple-orange)' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: 'var(--glass-border)', margin: '0 0 1.5rem 0' }} />

      {/* Section 3: Playback & Export */}
      <div className="mt-auto">
        {/* A/B Toggle */}
        <div className="mb-3 d-flex align-items-center gap-2">
          <button
            onClick={() => setPlayMode('original')}
            className="btn btn-sm px-3 rounded-pill"
            style={{
              backgroundColor: playMode === 'original' ? 'var(--apple-blue)' : 'var(--glass-bg)',
              color: playMode === 'original' ? '#fff' : 'var(--text-secondary)',
              border: playMode === 'original' ? 'none' : '1px solid var(--glass-border)',
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            Original
          </button>
          <button
            onClick={() => setPlayMode('processed')}
            className="btn btn-sm px-3 rounded-pill"
            style={{
              backgroundColor: playMode === 'processed' ? 'var(--apple-green)' : 'var(--glass-bg)',
              color: playMode === 'processed' ? '#000' : 'var(--text-secondary)',
              border: playMode === 'processed' ? 'none' : '1px solid var(--glass-border)',
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            Procesado
          </button>
        </div>

        {/* Playback Controls */}
        <div className="glass-panel p-3 mb-3">
          <div className="d-flex align-items-center gap-3">
            <button
              onClick={handlePlayPause}
              className="icon-btn"
              style={{ width: '40px', height: '40px' }}
            >
              <span className="material-symbols-outlined fs-5">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
            
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between mb-1">
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {formatTime(currentTime)}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {formatTime(duration)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={duration || 1}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="form-range custom-range"
                style={{ accentColor: 'var(--apple-blue)' }}
              />
            </div>
          </div>
        </div>

        {/* Process / Export Buttons */}
        <div className="d-flex gap-2">
          <button
            onClick={handleProcess}
            disabled={!selectedTrack.rawAudioBuffer || isProcessing}
            className="btn flex-grow-1"
            style={{
              backgroundColor: isProcessing ? 'var(--apple-orange)' : 'var(--apple-blue)',
              color: '#fff',
              borderRadius: 'var(--radius-full)',
              padding: '0.6rem 1.5rem',
              fontWeight: 600,
              fontSize: '0.85rem',
              opacity: !selectedTrack.rawAudioBuffer || isProcessing ? 0.5 : 1,
              cursor: !selectedTrack.rawAudioBuffer || isProcessing ? 'not-allowed' : 'pointer',
            }}
          >
            {isProcessing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Procesando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined fs-6 me-1">auto_fix_high</span>
                {selectedTrack.status === 'completed' ? 'Reprocesar' : 'Procesar Audio'}
              </>
            )}
          </button>

          <button
            onClick={handleExport}
            disabled={selectedTrack.status !== 'completed'}
            className="btn"
            style={{
              backgroundColor: selectedTrack.status === 'completed' ? 'var(--apple-green)' : 'var(--glass-bg)',
              color: selectedTrack.status === 'completed' ? '#000' : 'var(--text-tertiary)',
              borderRadius: 'var(--radius-full)',
              padding: '0.6rem 1.5rem',
              fontWeight: 600,
              fontSize: '0.85rem',
              border: 'none',
              opacity: selectedTrack.status === 'completed' ? 1 : 0.5,
              cursor: selectedTrack.status === 'completed' ? 'pointer' : 'not-allowed',
            }}
          >
            <span className="material-symbols-outlined fs-6 me-1">download</span>
            Exportar
          </button>
        </div>
      </div>
    </div>
  );
};
