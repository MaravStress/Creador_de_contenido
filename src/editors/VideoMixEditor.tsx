// ==========================================================================
// VideoMixEditor — Editor principal de mezcla de videos
// ==========================================================================

import React, { useEffect, useState } from 'react';
import { useVideoMix } from '../hooks/useVideoMix';
import { TopBar } from '../components/videomix/TopBar';
import { VideoColumn } from '../components/videomix/VideoColumn';
import { ProcessingModal } from '../components/videomix/ProcessingModal';

export const VideoMixEditor: React.FC<{ onBack: () => void }> = (_props) => {
  const {
    state,
    addColumn,
    removeColumn,
    addVideoToColumn,
    removeVideoFromColumn,
    generateCombinations,
  } = useVideoMix();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-generate combinations when columns change
  useEffect(() => {
    if (state.columns.length > 0) {
      generateCombinations();
    }
  }, [state.columns, generateCombinations]);

  return (
    <div className="h-100 d-flex flex-column">
      {/* Top Bar */}
      <TopBar
        totalCombinations={state.totalCombinations}
        isProcessing={state.isProcessing}
        currentProgress={state.currentProgress}
        completedCount={state.completedCount}
        totalCount={state.totalCount}
        onOpenModal={() => setIsModalOpen(true)}
      />

      {/* Main Content */}
      <div className="flex-grow-1 d-flex overflow-hidden">
        {/* Columns Container */}
        <div className="d-flex overflow-auto" style={{ flex: 1 }}>
          {state.columns.length === 0 ? (
            // Empty State
            <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center">
              <div className="text-center">
                <span
                  className="material-symbols-outlined mb-4"
                  style={{ fontSize: '4rem', color: 'var(--text-tertiary)', opacity: 0.3 }}
                >
                  shuffle
                </span>
                <h4 className="fw-medium mb-2" style={{ letterSpacing: '-0.01em', fontWeight: 500 }}>
                  Mezclador de Videos
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '420px', lineHeight: '1.6' }}>
                  Crea variaciones de videos mezclándolos entre sí.
                  Agrega columnas y videos para generar todas las combinaciones posibles.
                </p>
                <button
                  onClick={addColumn}
                  className="btn mt-3"
                  style={{
                    backgroundColor: 'var(--apple-blue)',
                    color: '#fff',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.6rem 1.5rem',
                    fontWeight: 500,
                    fontSize: '0.85rem',
                  }}
                >
                  <span className="material-symbols-outlined fs-6 me-1">add</span>
                  Agregar Columna
                </button>
              </div>
            </div>
          ) : (
            // Columns
            <>
              {state.columns.map((column, index) => (
                <VideoColumn
                  key={column.id}
                  column={column}
                  columnIndex={index}
                  onAddVideo={addVideoToColumn}
                  onRemoveVideo={removeVideoFromColumn}
                  onRemoveColumn={removeColumn}
                />
              ))}

              {/* Add Column Button */}
              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: '250px',
                  minWidth: '250px',
                  borderLeft: '1px dashed var(--glass-border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s var(--ease-apple)',
                }}
                onClick={addColumn}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(10,132,255,0.05)';
                  e.currentTarget.style.borderLeftColor = 'var(--apple-blue)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderLeftColor = 'var(--glass-border)';
                }}
              >
                <div className="text-center p-4">
                  <span className="material-symbols-outlined fs-4 mb-2 d-block" style={{ color: 'var(--text-secondary)' }}>
                    add_circle
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Agregar Columna
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Processing Modal */}
      <ProcessingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        combinations={state.combinations}
        onProcessComplete={() => {}}
      />
    </div>
  );
};
