import React from 'react';
import type { ActiveTool, TimelineClip, Track } from './types';

interface VideoTrackProps {
  track: Track;
  clips: TimelineClip[];
  selectedClipId: string | null;
  activeTool: ActiveTool;
  pxPerSec: number;
  onSelectClip: (clipId: string) => void;
  onClipCut: (clipId: string, cutTime: number) => void;
  onClipMoveStart: (e: React.MouseEvent, clip: TimelineClip) => void;
  onTrimStart: (e: React.MouseEvent, clip: TimelineClip, handle: 'start' | 'end') => void;
}

export const VideoTrack: React.FC<VideoTrackProps> = ({
  track,
  clips,
  selectedClipId,
  activeTool,
  pxPerSec,
  onSelectClip,
  onClipCut,
  onClipMoveStart,
  onTrimStart,
}) => {
  return (
    <div
      data-track-id={track.id}
      data-track-type="video"
      className="d-flex align-items-center position-relative border-bottom"
      style={{
        height: '64px',
        backgroundColor: 'rgba(15, 17, 22, 0.6)',
        borderColor: 'rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* Track Header Label (Sticky Left, Fixed horizontally, Scrolls vertically with tracks) */}
      <div
        className="d-flex align-items-center justify-content-between px-2 flex-shrink-0 border-end"
        style={{
          position: 'sticky',
          left: 0,
          width: '120px',
          height: '100%',
          backgroundColor: 'rgba(18, 20, 28, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderColor: 'var(--glass-border)',
          zIndex: 10,
        }}
      >
        <div className="d-flex align-items-center gap-1">
          <span className="badge bg-primary px-1 py-05" style={{ fontSize: '0.7rem' }}>
            {track.id}
          </span>
          <span className="fw-semibold extra-small text-white-50" style={{ fontSize: '0.75rem' }}>
            {track.name}
          </span>
        </div>

        <div className="d-flex align-items-center gap-1">
          <span
            className={`material-symbols-outlined fs-6 cursor-pointer ${
              track.isHidden ? 'text-danger' : 'text-white-50'
            }`}
            title={track.isHidden ? 'Mostrar pista' : 'Ocultar pista'}
          >
            {track.isHidden ? 'visibility_off' : 'visibility'}
          </span>
        </div>
      </div>

      {/* Track Clips Container */}
      <div className="position-relative flex-grow-1 h-100 overflow-visible">
        {clips.map((clip) => {
          const isSelected = selectedClipId === clip.id;
          const clipWidth = Math.max(20, clip.duration * pxPerSec);
          const clipLeft = clip.startTime * pxPerSec;

          return (
            <div
              key={clip.id}
              onClick={(e) => {
                e.stopPropagation();
                if (activeTool === 'cut') {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const clickRatio = clickX / rect.width;
                  const cutOffset = clip.duration * clickRatio;
                  onClipCut(clip.id, cutOffset);
                } else {
                  onSelectClip(clip.id);
                }
              }}
              onMouseDown={(e) => {
                if (activeTool === 'select') {
                  onClipMoveStart(e, clip);
                }
              }}
              className={`position-absolute rounded-2 overflow-hidden user-select-none d-flex align-items-center justify-content-between shadow-sm ${
                isSelected ? 'border border-2 border-primary' : 'border border-secondary border-opacity-50'
              }`}
              style={{
                left: `${clipLeft}px`,
                width: `${clipWidth}px`,
                height: '48px',
                top: '8px',
                background: clip.color || 'linear-gradient(135deg, rgba(10, 132, 255, 0.4) 0%, rgba(191, 90, 242, 0.3) 100%)',
                cursor: activeTool === 'cut' ? 'crosshair' : 'grab',
                backdropFilter: 'blur(4px)',
                zIndex: isSelected ? 5 : 2,
              }}
            >
              {/* Left Trim Handle */}
              <div
                className="h-100 bg-white bg-opacity-25 hover-bright cursor-ew-resize"
                style={{ width: '8px' }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onTrimStart(e, clip, 'start');
                }}
                title="Recortar inicio"
              />

              {/* Clip Details */}
              <div className="d-flex align-items-center gap-1 px-2 text-truncate w-100">
                <span className="material-symbols-outlined fs-6 text-light flex-shrink-0">movie</span>
                <span className="fw-semibold text-white text-truncate extra-small" style={{ fontSize: '0.75rem' }}>
                  {clip.title}
                </span>

                {clip.isLinked && (
                  <span
                    className="material-symbols-outlined fs-6 text-info flex-shrink-0 ms-auto"
                    title="Enlazado a pista de audio"
                    style={{ fontSize: '14px' }}
                  >
                    link
                  </span>
                )}
              </div>

              {/* Right Trim Handle */}
              <div
                className="h-100 bg-white bg-opacity-25 hover-bright cursor-ew-resize"
                style={{ width: '8px' }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onTrimStart(e, clip, 'end');
                }}
                title="Recortar fin"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
