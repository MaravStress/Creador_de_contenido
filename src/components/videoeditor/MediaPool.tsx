import React, { useRef } from 'react';
import type { MediaAsset } from './types';

interface MediaPoolProps {
  assets: MediaAsset[];
  onAddAsset: (asset: MediaAsset) => void;
  onAddToTimeline: (asset: MediaAsset) => void;
}

export const MediaPool: React.FC<MediaPoolProps> = ({ assets, onAddAsset, onAddToTimeline }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith('video/');
      const isAudio = file.type.startsWith('audio/');
      const url = URL.createObjectURL(file);

      if (isVideo) {
        // Create HTMLVideoElement to obtain duration
        const videoEl = document.createElement('video');
        videoEl.src = url;
        videoEl.onloadedmetadata = () => {
          const asset: MediaAsset = {
            id: 'asset-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
            title: file.name,
            type: 'video-audio', // standard video input defaults to linked video+audio
            url,
            duration: Math.round(videoEl.duration) || 10,
            fileName: file.name,
          };
          onAddAsset(asset);
        };
      } else if (isAudio) {
        const audioEl = document.createElement('audio');
        audioEl.src = url;
        audioEl.onloadedmetadata = () => {
          const asset: MediaAsset = {
            id: 'asset-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
            title: file.name,
            type: 'audio',
            url,
            duration: Math.round(audioEl.duration) || 10,
            fileName: file.name,
          };
          onAddAsset(asset);
        };
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragStart = (e: React.DragEvent, asset: MediaAsset) => {
    e.dataTransfer.setData('application/json', JSON.stringify(asset));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel p-3 d-flex flex-column h-100" style={{ borderRadius: 'var(--radius-md)', minHeight: '260px' }}>
      {/* Panel Title & Import Button */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <span className="material-symbols-outlined text-primary fs-5">perm_media</span>
          <h6 className="m-0 fw-bold text-white">Panel de Medios</h6>
          <span className="badge bg-secondary rounded-pill">{assets.length}</span>
        </div>

        <button
          className="btn btn-primary btn-sm rounded-pill d-flex align-items-center gap-1 px-3 py-1"
          onClick={() => fileInputRef.current?.click()}
          style={{ fontSize: '0.8rem', fontWeight: 600 }}
        >
          <span className="material-symbols-outlined fs-6">upload_file</span>
          Importar
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,audio/*"
          multiple
          className="d-none"
          onChange={handleFileUpload}
        />
      </div>

      {/* Media Items Grid / List */}
      <div className="flex-grow-1 overflow-auto pe-1" style={{ maxHeight: 'calc(100% - 45px)' }}>
        {assets.length === 0 ? (
          <div
            className="d-flex flex-column align-items-center justify-content-center h-100 p-4 border border-dashed rounded-3 text-center"
            style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}
          >
            <span className="material-symbols-outlined fs-1 mb-2 text-white-50">cloud_upload</span>
            <p className="small mb-1">No hay medios importados</p>
            <span className="extra-small text-white-50" style={{ fontSize: '0.75rem' }}>
              Arrastra archivos de video/audio aquí o haz clic en "Importar".
            </span>
          </div>
        ) : (
          <div className="row g-2">
            {assets.map((asset) => (
              <div key={asset.id} className="col-6 col-md-12">
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, asset)}
                  className="p-2 rounded-3 glass-panel hover-glass d-flex align-items-center justify-content-between"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--glass-border)',
                    cursor: 'grab',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div className="d-flex align-items-center gap-2 overflow-hidden me-2">
                    {/* Thumbnail / Icon */}
                    <div
                      className="rounded d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: '36px',
                        height: '36px',
                        background:
                          asset.type === 'video-audio'
                            ? 'rgba(10, 132, 255, 0.2)'
                            : asset.type === 'video'
                            ? 'rgba(191, 90, 242, 0.2)'
                            : 'rgba(48, 209, 88, 0.2)',
                        color:
                          asset.type === 'video-audio'
                            ? 'var(--apple-blue)'
                            : asset.type === 'video'
                            ? 'var(--apple-purple)'
                            : 'var(--apple-green)',
                      }}
                    >
                      <span className="material-symbols-outlined fs-5">
                        {asset.type === 'video-audio'
                          ? 'movie'
                          : asset.type === 'video'
                          ? 'videocam'
                          : 'audiotrack'}
                      </span>
                    </div>

                    <div className="overflow-hidden">
                      <div
                        className="text-truncate fw-semibold text-white"
                        style={{ fontSize: '0.82rem' }}
                        title={asset.title}
                      >
                        {asset.title}
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-dark text-white-50 extra-small" style={{ fontSize: '0.65rem' }}>
                          {asset.type === 'video-audio'
                            ? 'Video + Audio'
                            : asset.type === 'video'
                            ? 'Solo Video'
                            : 'Solo Audio'}
                        </span>
                        <span className="extra-small text-white-50" style={{ fontSize: '0.7rem' }}>
                          {formatTime(asset.duration)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Add to timeline button */}
                  <button
                    className="btn btn-sm btn-dark rounded-circle p-1 d-flex align-items-center justify-content-center flex-shrink-0"
                    onClick={() => onAddToTimeline(asset)}
                    title="Añadir a la línea de tiempo"
                    style={{ width: '28px', height: '28px', border: '1px solid var(--glass-border)' }}
                  >
                    <span className="material-symbols-outlined fs-6 text-primary">add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
