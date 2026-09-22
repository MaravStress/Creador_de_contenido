// ==========================================================================
// TrackListPanel — Panel Izquierdo (20%)
// Carga, gestión y selección de pistas de audio/video
// ==========================================================================

import React, { useRef, useState } from 'react';
import type { AudioTrackItem } from '../../types/audioCleanup';

interface TrackListPanelProps {
  tracks: AudioTrackItem[];
  selectedTrackId: string | null;
  isProcessing: boolean;
  queueLength: number;
  onSelectTrack: (id: string) => void;
  onRemoveTrack: (id: string) => void;
  onAddTracks: (files: File[]) => void;
}

export const TrackListPanel: React.FC<TrackListPanelProps> = ({
  tracks,
  selectedTrackId,
  isProcessing,
  queueLength,
  onSelectTrack,
  onRemoveTrack,
  onAddTracks,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onAddTracks(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onAddTracks(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusBadge = (track: AudioTrackItem) => {
    switch (track.status) {
      case 'idle':
        return <span className="badge rounded-pill" style={{ backgroundColor: 'rgba(255,255,255,0.1)', fontSize: '0.65rem' }}>Listo</span>;
      case 'queued':
        return <span className="badge rounded-pill" style={{ backgroundColor: 'rgba(10,132,255,0.3)', color: '#fff', fontSize: '0.65rem' }}>En cola</span>;
      case 'processing':
        return (
          <span className="badge rounded-pill" style={{ backgroundColor: 'rgba(255,159,10,0.3)', color: '#fff', fontSize: '0.65rem' }}>
            Procesando {track.progress}%
          </span>
        );
      case 'completed':
        return <span className="badge rounded-pill" style={{ backgroundColor: 'rgba(48,209,88,0.3)', color: '#fff', fontSize: '0.65rem' }}>Completado</span>;
      case 'error':
        return <span className="badge rounded-pill" style={{ backgroundColor: 'rgba(255,69,58,0.3)', color: '#fff', fontSize: '0.65rem' }}>Error</span>;
      default:
        return null;
    }
  };

  const getTrackIcon = (type: 'audio' | 'video') => {
    return type === 'video' ? 'videocam' : 'audio_file';
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="d-flex flex-column h-100 p-3"
      style={{
        background: 'var(--glass-bg)',
        borderRight: '1px solid var(--glass-border)',
      }}
    >
      {/* Header */}
      <div className="mb-3 d-flex align-items-center justify-content-between">
        <h6 className="fw-bold mb-0" style={{ fontSize: '0.85rem', letterSpacing: '-0.01em' }}>
          Pistas
        </h6>
        <span className="badge rounded-pill" style={{ backgroundColor: 'rgba(255,255,255,0.08)', fontSize: '0.65rem' }}>
          {tracks.length}
        </span>
      </div>

      {/* Queue Status */}
      {queueLength > 0 && (
        <div className="mb-3 px-2 py-2 rounded-3" style={{ backgroundColor: 'rgba(10,132,255,0.1)', border: '1px solid rgba(10,132,255,0.2)' }}>
          <div className="d-flex align-items-center gap-2">
            <span className="material-symbols-outlined fs-6" style={{ color: 'var(--apple-blue)' }}>queue_play_next</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {queueLength} en cola{isProcessing ? ' · Procesando...' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Dropzone */}
      <div
        className="mb-3"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          padding: '1.5rem 1rem',
          borderRadius: 'var(--radius-md)',
          border: `2px dashed ${isDragging ? 'var(--apple-blue)' : 'var(--glass-border)'}`,
          backgroundColor: isDragging ? 'rgba(10,132,255,0.08)' : 'transparent',
          cursor: 'pointer',
          transition: 'all 0.2s var(--ease-apple)',
          textAlign: 'center',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,video/mp4,video/webm,video/quicktime"
          multiple
          onChange={handleFileSelect}
          className="d-none"
        />
        <span className="material-symbols-outlined fs-4 mb-2 d-block" style={{ color: 'var(--text-secondary)' }}>
          upload_file
        </span>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
          Arrastra audios o videos aquí
        </p>
      </div>

      {/* Track List */}
      <div className="flex-grow-1 overflow-auto">
        {tracks.length === 0 ? (
          <div className="text-center py-4">
            <span className="material-symbols-outlined fs-4 mb-2 d-block" style={{ color: 'var(--text-tertiary)' }}>
              inbox
            </span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              No hay pistas cargadas
            </p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {tracks.map(track => (
              <div
                key={track.id}
                onClick={() => !isProcessing || track.status !== 'processing' ? onSelectTrack(track.id) : null}
                className="p-2 rounded-3 d-flex flex-column gap-2"
                style={{
                  backgroundColor: selectedTrackId === track.id ? 'rgba(10,132,255,0.15)' : 'transparent',
                  border: selectedTrackId === track.id ? '1px solid rgba(10,132,255,0.3)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s var(--ease-apple)',
                }}
              >
                {/* Track Header */}
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined fs-5" style={{ color: 'var(--text-secondary)' }}>
                      {getTrackIcon(track.originalType)}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 500, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {track.name}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveTrack(track.id);
                    }}
                    className="btn btn-sm p-0"
                    style={{ color: 'var(--text-tertiary)', padding: '2px', minWidth: 'auto', height: 'auto' }}
                  >
                    <span className="material-symbols-outlined fs-6" style={{ fontSize: '16px' }}>close</span>
                  </button>
                </div>

                {/* Track Info */}
                <div className="d-flex align-items-center justify-content-between">
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                    {formatDuration(track.duration)}
                  </span>
                  {getStatusBadge(track)}
                </div>

                {/* Progress Bar */}
                {track.status === 'processing' && (
                  <div className="progress" style={{ height: '3px', borderRadius: '2px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: `${track.progress}%`,
                        backgroundColor: 'var(--apple-orange)',
                        borderRadius: '2px',
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
