import React, { useRef, useEffect } from 'react';
import type { OrientationMode, TimelineClip } from './types';

interface VideoPreviewProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  activeClip: TimelineClip | null;
  orientation: OrientationMode;
  fps?: number;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  currentTime,
  duration,
  isPlaying,
  onTogglePlay,
  onSeek,
  activeClip,
  orientation,
  fps = 30,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Format timecode into HH:MM:SS:FF
  const formatTimecode = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * fps);

    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames
      .toString()
      .padStart(2, '0')}`;
  };

  // Sync video element with current playhead time & clip offset
  useEffect(() => {
    if (!videoRef.current || !activeClip) return;

    // Local video position = (currentTime - clip.startTime) + clip.inTime
    const localTime = currentTime - activeClip.startTime + activeClip.inTime;
    
    if (localTime >= activeClip.inTime && localTime <= activeClip.outTime) {
      if (Math.abs(videoRef.current.currentTime - localTime) > 0.2) {
        videoRef.current.currentTime = localTime;
      }
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    } else {
      videoRef.current.pause();
    }
  }, [currentTime, isPlaying, activeClip]);

  const isVertical = orientation === 'vertical';

  return (
    <div
      className="glass-panel p-3 d-flex flex-column align-items-center justify-content-between h-100 w-100"
      style={{
        borderRadius: 'var(--radius-md)',
        minHeight: '320px',
      }}
    >
      {/* Top Bar: Timecode indicator & Ratio Tag */}
      <div className="w-100 d-flex align-items-center justify-content-between mb-2">
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-dark border border-secondary text-info font-monospace py-1 px-2" style={{ fontSize: '0.85rem' }}>
            TC {formatTimecode(currentTime)}
          </span>
          <span className="text-white-50 extra-small" style={{ fontSize: '0.75rem' }}>
            / {formatTimecode(duration)}
          </span>
        </div>

        <span className="badge rounded-pill bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25">
          {isVertical ? '9:16 Vertical' : '16:9 Horizontal'}
        </span>
      </div>

      {/* Screen Frame Display */}
      <div
        className="position-relative w-100 d-flex align-items-center justify-content-center bg-black rounded-3 overflow-hidden border border-secondary border-opacity-25 shadow-lg my-auto"
        style={{
          aspectRatio: isVertical ? '9/16' : '16/9',
          background: '#000',
        }}
      >
        {activeClip && activeClip.url ? (
          <video
            ref={videoRef}
            src={activeClip.url}
            className="w-100 h-100"
            style={{ objectFit: 'contain' }}
            playsInline
            muted={false}
          />
        ) : (
          <div className="text-center p-4" style={{ color: 'var(--text-secondary)' }}>
            <span className="material-symbols-outlined display-3 opacity-25 mb-2">movie_filter</span>
            <div className="fw-semibold">Sin señal / Cabezal sin clip</div>
            <p className="extra-small text-white-50 m-0" style={{ fontSize: '0.75rem' }}>
              Mueve el cabezal de reproducción sobre un clip en la línea de tiempo.
            </p>
          </div>
        )}

        {/* Overlay Title of active clip */}
        {activeClip && (
          <div
            className="position-absolute bottom-0 start-0 m-2 px-2 py-1 rounded bg-dark bg-opacity-75 text-white extra-small"
            style={{ fontSize: '0.7rem', backdropFilter: 'blur(4px)' }}
          >
            <span className="material-symbols-outlined align-middle fs-6 me-1 text-primary">videocam</span>
            {activeClip.title}
          </div>
        )}
      </div>

      {/* Transport Controls Bar */}
      <div className="w-100 d-flex align-items-center justify-content-center gap-3 mt-3">
        {/* Jump to start */}
        <button
          className="icon-btn rounded-circle"
          onClick={() => onSeek(0)}
          title="Ir al inicio (Home)"
          style={{ width: '36px', height: '36px' }}
        >
          <span className="material-symbols-outlined fs-5">first_page</span>
        </button>

        {/* Step back 1s */}
        <button
          className="icon-btn rounded-circle"
          onClick={() => onSeek(Math.max(0, currentTime - 1))}
          title="Retroceder 1 segundo"
          style={{ width: '36px', height: '36px' }}
        >
          <span className="material-symbols-outlined fs-5">replay_5</span>
        </button>

        {/* Main Play / Pause Button */}
        <button
          className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center shadow-lg"
          onClick={onTogglePlay}
          title={isPlaying ? 'Pausar (Espacio)' : 'Reproducir (Espacio)'}
          style={{ width: '48px', height: '48px', backgroundColor: 'var(--apple-blue)' }}
        >
          <span className="material-symbols-outlined fs-3">
            {isPlaying ? 'pause' : 'play_arrow'}
          </span>
        </button>

        {/* Step forward 1s */}
        <button
          className="icon-btn rounded-circle"
          onClick={() => onSeek(Math.min(duration, currentTime + 1))}
          title="Avanzar 1 segundo"
          style={{ width: '36px', height: '36px' }}
        >
          <span className="material-symbols-outlined fs-5">forward_5</span>
        </button>

        {/* Jump to end */}
        <button
          className="icon-btn rounded-circle"
          onClick={() => onSeek(duration)}
          title="Ir al final (End)"
          style={{ width: '36px', height: '36px' }}
        >
          <span className="material-symbols-outlined fs-5">last_page</span>
        </button>
      </div>
    </div>
  );
};
