// ==========================================================================
// VideoCard — Tarjeta de video individual
// ==========================================================================

import React, { useRef, useEffect } from 'react';
import type { VideoItem } from '../../types/videoMix';

interface VideoCardProps {
  video: VideoItem;
  onRemove: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onRemove }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && video.url) {
      videoRef.current.src = video.url;
    }
  }, [video.url]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="glass-panel p-2 d-flex flex-column gap-2"
      style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
    >
      {/* Video Preview */}
      <div className="position-relative rounded-3 overflow-hidden" style={{ backgroundColor: '#000' }}>
        <video
          ref={videoRef}
          className="w-100"
          style={{ height: '120px', objectFit: 'cover' }}
          muted
          playsInline
        />
        <div className="position-absolute bottom-0 start-0 p-2" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <span style={{ fontSize: '0.7rem', color: '#fff' }}>
            {formatDuration(video.duration)}
          </span>
        </div>
      </div>

      {/* Video Info */}
      <div className="d-flex align-items-center justify-content-between" style={{ width: '100%' }}>
        <div className="flex-grow-1 min-w-0" style={{ width: '100%' }}>
          <div
            className="text-truncate"
            style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-primary)', lineHeight: '1.4', maxWidth: '100%' }}
            title={video.file.name}
          >
            {video.file.name}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            {(video.file.size / 1024 / 1024).toFixed(1)} MB · {formatDuration(video.duration)}
          </div>
        </div>
        <button
          onClick={onRemove}
          className="btn btn-sm p-0"
          style={{ color: 'var(--text-tertiary)', padding: '4px', minWidth: 'auto', height: 'auto', flexShrink: 0 }}
          title="Eliminar video"
        >
          <span className="material-symbols-outlined fs-6" style={{ fontSize: '16px' }}>close</span>
        </button>
      </div>
    </div>
  );
};
