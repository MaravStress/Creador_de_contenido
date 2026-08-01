import React from 'react';
import type { ActiveTool } from './types';

interface TimelineToolbarProps {
  activeTool: ActiveTool;
  onSelectTool: (tool: ActiveTool) => void;
  isSnapping: boolean;
  onToggleSnapping: () => void;
  onSplitAtPlayhead: () => void;
  onUnlinkSelected: () => void;
  onDeleteSelected: (ripple: boolean) => void;
  selectedClipId: string | null;
  isClipLinked: boolean;
  zoomLevel: number;
  onZoomChange: (level: number) => void;
  onAddTrack?: (type: 'video' | 'audio') => void;
}

export const TimelineToolbar: React.FC<TimelineToolbarProps> = ({
  activeTool,
  onSelectTool,
  isSnapping,
  onToggleSnapping,
  onSplitAtPlayhead,
  onUnlinkSelected,
  onDeleteSelected,
  selectedClipId,
  isClipLinked,
  zoomLevel,
  onZoomChange,
  onAddTrack,
}) => {
  return (
    <div
      className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom"
      style={{
        background: 'rgba(20, 22, 28, 0.95)',
        borderColor: 'var(--glass-border)',
        borderTopLeftRadius: 'var(--radius-md)',
        borderTopRightRadius: 'var(--radius-md)',
      }}
    >
      {/* Left: DaVinci Resolve Editing Tools */}
      <div className="d-flex align-items-center gap-1">
        {/* Select Tool (A) */}
        <button
          className={`btn btn-sm d-flex align-items-center gap-1 rounded ${activeTool === 'select' ? 'btn-primary' : 'btn-dark text-white-50'
            }`}
          onClick={() => onSelectTool('select')}
          title="Herramienta Selección (A)"
          style={{ fontSize: '0.8rem', fontWeight: 600 }}
        >
          <span className="material-symbols-outlined fs-6">near_me</span>
          Selección [A]
        </button>

        {/* Blade / Cut Tool (B) */}
        <button
          className={`btn btn-sm d-flex align-items-center gap-1 rounded ${activeTool === 'cut' ? 'btn-primary' : 'btn-dark text-white-50'
            }`}
          onClick={() => onSelectTool('cut')}
          title="Herramienta Corte / Cuchilla (B)"
          style={{ fontSize: '0.8rem', fontWeight: 600 }}
        >
          <span className="material-symbols-outlined fs-6">content_cut</span>
          Corte [B]
        </button>

        <div className="vr mx-2 bg-secondary opacity-50" style={{ height: '20px' }}></div>

        {/* Snapping Magnet (N) */}
        <button
          className={`btn btn-sm d-flex align-items-center gap-1 rounded transition-all ${isSnapping ? 'btn-info text-dark fw-bold shadow-sm' : 'btn-dark text-white-50 opacity-75'
            }`}
          onClick={onToggleSnapping}
          title="Ajuste magnético / Imán (N)"
          style={{ fontSize: '0.8rem' }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 15v-7a6 6 0 1 1 12 0v7" />
            <path d="M4 15h4v4H4z" />
            <path d="M16 15h4v4h-4z" />
          </svg>
          Imán [N]
        </button>

        {/* Split at Playhead (C) */}
        <button
          className="btn btn-sm btn-dark text-light d-flex align-items-center gap-1 rounded"
          onClick={onSplitAtPlayhead}
          disabled={!selectedClipId}
          title="Dividir clip en el cabezal de reproducción (C)"
          style={{ fontSize: '0.8rem' }}
        >
          <span className="material-symbols-outlined fs-6">splitscreen</span>
          Dividir [C]
        </button>

        {/* Unlink Video & Audio (Ctrl+L) */}
        <button
          className={`btn btn-sm d-flex align-items-center gap-1 rounded ${isClipLinked ? 'btn-outline-warning' : 'btn-dark text-white-50'
            }`}
          onClick={onUnlinkSelected}
          disabled={!selectedClipId}
          title="Desenlazar / Enlazar Video y Audio (Ctrl+L)"
          style={{ fontSize: '0.8rem' }}
        >
          <span className="material-symbols-outlined fs-6">
            {isClipLinked ? 'link_off' : 'link'}
          </span>
          {isClipLinked ? 'Desenlazar [Ctrl+L]' : 'Enlazado'}
        </button>

        <div className="vr mx-2 bg-secondary opacity-50" style={{ height: '20px' }}></div>

        {/* Delete (Backspace) */}
        <button
          className="btn btn-sm btn-dark text-white-50 hover-danger d-flex align-items-center gap-1 rounded"
          onClick={() => onDeleteSelected(false)}
          disabled={!selectedClipId}
          title="Eliminar clip (Backspace)"
          style={{ fontSize: '0.8rem' }}
        >
          <span className="material-symbols-outlined fs-6 text-danger">delete</span>
          Borrar
        </button>

        {/* Ripple Delete (Shift+Backspace) */}
        <button
          className="btn btn-sm btn-dark text-white-50 hover-danger d-flex align-items-center gap-1 rounded"
          onClick={() => onDeleteSelected(true)}
          disabled={!selectedClipId}
          title="Ripple Delete: Eliminar y ajustar espacio (Shift+Backspace)"
          style={{ fontSize: '0.8rem' }}
        >
          <span className="material-symbols-outlined fs-6 text-warning">keyboard_tab</span>
          Ripple Delete
        </button>

        {onAddTrack && (
          <>
            <div className="vr mx-2 bg-secondary opacity-50" style={{ height: '20px' }}></div>
            <button
              className="btn btn-sm btn-outline-primary text-white d-flex align-items-center gap-1 rounded py-1 px-2"
              onClick={() => onAddTrack('video')}
              title="Añadir pista de video (V3, V4...)"
              style={{ fontSize: '0.75rem' }}
            >
              <span className="material-symbols-outlined fs-6">add</span>
              + Pista Video
            </button>
            <button
              className="btn btn-sm btn-outline-success text-white d-flex align-items-center gap-1 rounded py-1 px-2"
              onClick={() => onAddTrack('audio')}
              title="Añadir pista de audio (A3, A4...)"
              style={{ fontSize: '0.75rem' }}
            >
              <span className="material-symbols-outlined fs-6">add</span>
              + Pista Audio
            </button>
          </>
        )}
      </div>

      {/* Right: Timeline Zoom Slider */}
      <div className="d-flex align-items-center gap-2">
        <span className="material-symbols-outlined fs-6 text-white-50">zoom_out</span>
        <input
          type="range"
          className="form-range"
          min="20"
          max="150"
          value={zoomLevel}
          onChange={(e) => onZoomChange(Number(e.target.value))}
          style={{ width: '100px', cursor: 'pointer' }}
        />
        <span className="material-symbols-outlined fs-6 text-white-50">zoom_in</span>
      </div>
    </div>
  );
};
