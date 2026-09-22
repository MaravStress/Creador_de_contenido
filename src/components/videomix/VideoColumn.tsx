// ==========================================================================
// VideoColumn — Columna de videos
// ==========================================================================

import React, { useRef } from 'react';
import type { VideoColumn as VideoColumnType } from '../../types/videoMix';
import { VideoCard } from './VideoCard';

interface VideoColumnProps {
  column: VideoColumnType;
  columnIndex: number;
  onAddVideo: (columnId: string, file: File) => void;
  onRemoveVideo: (columnId: string, videoId: string) => void;
  onRemoveColumn: (columnId: string) => void;
}

export const VideoColumn: React.FC<VideoColumnProps> = ({
  column,
  columnIndex,
  onAddVideo,
  onRemoveVideo,
  onRemoveColumn,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      if (file.type.startsWith('video/')) {
        onAddVideo(column.id, file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      if (file.type.startsWith('video/')) {
        onAddVideo(column.id, file);
      }
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className="d-flex flex-column h-100"
      style={{
        width: '250px',
        minWidth: '250px',
        backgroundColor: 'var(--glass-bg)',
        borderRight: '1px solid var(--glass-border)',
      }}
    >
      {/* Column Header */}
      <div className="p-3 d-flex align-items-center justify-content-between" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div className="d-flex align-items-center gap-2">
          <span
            className="badge rounded-pill"
            style={{
              backgroundColor: 'rgba(10,132,255,0.2)',
              color: 'var(--apple-blue)',
              fontSize: '0.7rem',
              fontWeight: 500,
            }}
          >
            Col {columnIndex + 1}
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-primary)' }}>
            {column.videos.length} videos
          </span>
        </div>
        <button
          onClick={() => onRemoveColumn(column.id)}
          className="btn btn-sm p-0"
          style={{ color: 'var(--text-tertiary)', padding: '4px' }}
          title="Eliminar columna"
        >
          <span className="material-symbols-outlined fs-6" style={{ fontSize: '16px' }}>delete</span>
        </button>
      </div>

      {/* Dropzone */}
      <div
        className="p-3"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          cursor: 'pointer',
          textAlign: 'center',
          padding: '1.5rem 1rem',
          borderRadius: 'var(--radius-md)',
          border: '2px dashed var(--glass-border)',
          backgroundColor: 'transparent',
          transition: 'all 0.2s var(--ease-apple)',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          multiple
          onChange={handleFileSelect}
          className="d-none"
        />
        <span className="material-symbols-outlined fs-4 mb-2 d-block" style={{ color: 'var(--text-secondary)' }}>
          videocam
        </span>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
          Arrastra o selecciona videos
        </p>
      </div>

      {/* Video List */}
      <div className="flex-grow-1 overflow-auto p-3">
        {column.videos.length === 0 ? (
          <div className="text-center py-4">
            <span className="material-symbols-outlined fs-4 mb-2 d-block" style={{ color: 'var(--text-tertiary)' }}>
              videocam
            </span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
              Sin videos
            </p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {column.videos.map(video => (
              <VideoCard
                key={video.id}
                video={video}
                onRemove={() => onRemoveVideo(column.id, video.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
