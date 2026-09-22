// ==========================================================================
// TopBar — Barra superior con contador de combinaciones
// ==========================================================================

import React from 'react';

interface TopBarProps {
  totalCombinations: number;
  isProcessing: boolean;
  currentProgress: number;
  completedCount: number;
  totalCount: number;
  onOpenModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  totalCombinations,
  isProcessing,
  currentProgress,
  completedCount,
  totalCount,
  onOpenModal,
}) => {
  return (
    <header
      className="px-4 py-3 d-flex align-items-center justify-content-between"
      style={{
        borderBottom: '1px solid var(--glass-border)',
        backgroundColor: 'var(--glass-bg)',
      }}
    >
      <div className="d-flex align-items-center gap-3">
        <button
          className="icon-btn"
          title="Volver al inicio"
          onClick={() => window.history.back()}
        >
          <span className="material-symbols-outlined fs-5">arrow_back</span>
        </button>
        <div className="text-start">
          <span
            className="text-uppercase fw-semibold px-3 py-1 rounded-pill d-inline-block mb-2"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              fontSize: '0.72rem',
              letterSpacing: '0.08em',
              color: 'var(--text-secondary)',
              border: '1px solid var(--glass-border)',
            }}
          >
            Mix Videos
          </span>
          <h2 className="fw-medium mb-0" style={{ letterSpacing: '-0.02em', fontSize: '1.25rem', fontWeight: 500 }}>
            Mezclador de Videos
          </h2>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Combinations Counter */}
        {totalCombinations > 0 && (
          <div
            className="glass-panel px-3 py-2 d-flex align-items-center gap-2"
            style={{ backgroundColor: 'rgba(10,132,255,0.1)', cursor: 'pointer' }}
            onClick={onOpenModal}
          >
            <span className="material-symbols-outlined fs-5" style={{ color: 'var(--apple-blue)' }}>
              view_in_ar
            </span>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                Combinaciones
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--apple-blue)' }}>
                {totalCombinations.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {isProcessing && (
          <div className="d-flex align-items-center gap-2" style={{ minWidth: '200px' }}>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between mb-1">
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  Procesando...
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: 400 }}>
                  {completedCount}/{totalCount}
                </span>
              </div>
              <div className="progress" style={{ height: '4px', borderRadius: '2px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{
                    width: `${currentProgress}%`,
                    backgroundColor: 'var(--apple-blue)',
                    borderRadius: '2px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
