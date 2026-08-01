import React from 'react';
import type { OrientationMode, VideoProject } from './types';

interface HeaderProps {
  projects: VideoProject[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onCreateNewProject: () => void;
  orientation: OrientationMode;
  onToggleOrientation: (mode: OrientationMode) => void;
  onOpenShortcuts: () => void;
  onBack: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateNewProject,
  orientation,
  onToggleOrientation,
  onOpenShortcuts,
  onBack,
}) => {
  return (
    <header className="d-flex align-items-center justify-content-between px-4 py-3 mb-3 glass-panel" style={{ borderRadius: 'var(--radius-md)' }}>
      {/* Left: Back button & Project selector */}
      <div className="d-flex align-items-center gap-3">
        <button
          className="icon-btn"
          onClick={onBack}
          title="Volver al menú principal"
          style={{ width: '38px', height: '38px', borderRadius: '50%' }}
        >
          <span className="material-symbols-outlined fs-5">arrow_back</span>
        </button>

        <div className="d-flex align-items-center gap-2">
          <span className="material-symbols-outlined text-primary fs-4">movie</span>
          <div>
            <div className="text-uppercase fw-semibold" style={{ fontSize: '0.68rem', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
              Editor de Video
            </div>
            
            {/* Project dropdown select */}
            <div className="d-flex align-items-center gap-2">
              <select
                className="form-select form-select-sm bg-dark text-light border-secondary"
                value={activeProjectId}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    onCreateNewProject();
                  } else {
                    onSelectProject(e.target.value);
                  }
                }}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderColor: 'var(--glass-border)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  maxWidth: '220px',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id} style={{ background: '#181920', color: '#fff' }}>
                    {proj.name} ({proj.orientation === 'horizontal' ? '16:9' : '9:16'})
                  </option>
                ))}
                <option value="__new__" style={{ background: '#181920', color: 'var(--apple-blue)' }}>
                  + Crear Nuevo Proyecto
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Aspect ratio switch & Shortcuts modal button */}
      <div className="d-flex align-items-center gap-3">
        {/* Orientation Switcher */}
        <div
          className="d-flex align-items-center p-1 rounded-pill"
          style={{
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid var(--glass-border)',
          }}
        >
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 d-flex align-items-center gap-1 ${
              orientation === 'horizontal' ? 'btn-primary shadow-sm' : 'btn-link text-white-50 text-decoration-none'
            }`}
            onClick={() => onToggleOrientation('horizontal')}
            style={{ fontSize: '0.8rem', fontWeight: 600 }}
          >
            <span className="material-symbols-outlined fs-6">crop_16_9</span>
            Horizontal (16:9)
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 d-flex align-items-center gap-1 ${
              orientation === 'vertical' ? 'btn-primary shadow-sm' : 'btn-link text-white-50 text-decoration-none'
            }`}
            onClick={() => onToggleOrientation('vertical')}
            style={{ fontSize: '0.8rem', fontWeight: 600 }}
          >
            <span className="material-symbols-outlined fs-6">crop_portrait</span>
            Vertical (9:16)
          </button>
        </div>

        {/* Shortcuts Button */}
        <button
          className="btn btn-outline-light btn-sm rounded-pill d-flex align-items-center gap-1 px-3 py-1"
          onClick={onOpenShortcuts}
          title="Ver atajos de teclado (DaVinci Resolve)"
          style={{
            borderColor: 'var(--glass-border)',
            fontSize: '0.82rem',
            background: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          <span className="material-symbols-outlined fs-6">keyboard</span>
          Atajos
        </button>
      </div>
    </header>
  );
};
