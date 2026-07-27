import React from 'react'
import type { CarouselSlide, CarouselConfig } from '../../types/carousel'

interface ControlTableProps {
  slides: CarouselSlide[]
  config: CarouselConfig
  onUpdateText: (slideId: string, field: 'dontDo' | 'doInstead', text: string) => void
  onOpenImageModal: (slideId: string, field: 'dontDo' | 'doInstead') => void
  onAddRow: () => void
  onDeleteRow: (slideId: string) => void
}

export const ControlTable: React.FC<ControlTableProps> = ({
  slides,
  config,
  onUpdateText,
  onOpenImageModal,
  onAddRow,
  onDeleteRow,
}) => {
  return (
    <>
      {/* Header section */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-shrink-0">
        <h3 className="h6 text-uppercase fw-bold m-0" style={{ letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>
          Láminas ({slides.length})
        </h3>
        <button
          onClick={onAddRow}
          tabIndex={0}
          className="btn btn-sm text-light d-flex align-items-center gap-1 px-3 py-1.5 rounded-pill"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid var(--glass-border)',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}
        >
          <span className="material-symbols-outlined fs-6">add</span>
          Añadir Fila
        </button>
      </div>

      {/* Table Area (Transparent background, expands vertically) */}
      <div className="table-responsive flex-grow-1 scrollbar-custom mb-3" style={{ overflowY: 'auto' }}>
        <table
          className="table table-borderless align-middle m-0 bg-transparent text-light"
          style={{ '--bs-table-bg': 'transparent', '--bs-table-accent-bg': 'transparent' } as React.CSSProperties}
        >
          <thead>
            <tr className="border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}>
              <th className="table-header-title" style={{ width: '45%' }}>
                {config.dontDoBadgeText}
              </th>
              <th className="table-header-title" style={{ width: '45%' }}>
                {config.doInsteadBadgeText}
              </th>
              <th style={{ width: '10%' }}></th>
            </tr>
          </thead>
          <tbody>
            {slides.map((slide, index) => (
              <tr
                key={slide.id}
                className="border-bottom table-row-glass"
                style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}
              >
                {/* ESTO NO Cell */}
                <td className="p-2">
                  <div className="d-flex flex-column gap-2">
                    <input
                      type="text"
                      tabIndex={0}
                      aria-label={`Fila ${index + 1} - Texto Esto No`}
                      className="form-control table-input-glass"
                      placeholder="Ej. Usar luz cenital..."
                      value={slide.dontDo.text}
                      onChange={(e) => onUpdateText(slide.id, 'dontDo', e.target.value)}
                    />
                    <button
                      type="button"
                      tabIndex={0}
                      aria-label={`Fila ${index + 1} - Imagen Esto No`}
                      onClick={() => onOpenImageModal(slide.id, 'dontDo')}
                      className="btn btn-sm text-light border-0 py-1.5 px-3 d-flex align-items-center justify-content-center gap-2 rounded-3 table-btn-glass"
                      style={{ fontSize: '0.78rem', fontWeight: 600 }}
                    >
                      {slide.dontDo.imageUrl ? (
                        <img src={slide.dontDo.imageUrl} alt="" style={{ width: '22px', height: '22px', objectFit: 'cover', borderRadius: '4px' }} />
                      ) : (
                        <span className="material-symbols-outlined fs-6 text-white-50">add_photo_alternate</span>
                      )}
                      <span>{slide.dontDo.imageUrl ? 'Cambiar Imagen' : 'Subir Imagen'}</span>
                    </button>
                  </div>
                </td>

                {/* ESTO SÍ Cell */}
                <td className="p-2">
                  <div className="d-flex flex-column gap-2">
                    <input
                      type="text"
                      tabIndex={0}
                      aria-label={`Fila ${index + 1} - Texto Esto Sí`}
                      className="form-control table-input-glass"
                      placeholder="Ej. Usar luz suave..."
                      value={slide.doInstead.text}
                      onChange={(e) => onUpdateText(slide.id, 'doInstead', e.target.value)}
                    />
                    <button
                      type="button"
                      tabIndex={0}
                      aria-label={`Fila ${index + 1} - Imagen Esto Sí`}
                      onClick={() => onOpenImageModal(slide.id, 'doInstead')}
                      className="btn btn-sm text-light border-0 py-1.5 px-3 d-flex align-items-center justify-content-center gap-2 rounded-3 table-btn-glass"
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                      }}
                    >
                      {slide.doInstead.imageUrl ? (
                        <img src={slide.doInstead.imageUrl} alt="" style={{ width: '22px', height: '22px', objectFit: 'cover', borderRadius: '4px' }} />
                      ) : (
                        <span className="material-symbols-outlined fs-6 text-white-50">add_photo_alternate</span>
                      )}
                      <span>{slide.doInstead.imageUrl ? 'Cambiar Imagen' : 'Subir Imagen'}</span>
                    </button>
                  </div>
                </td>

                {/* Delete Cell */}
                <td className="p-1 text-center">
                  <button
                    onClick={() => onDeleteRow(slide.id)}
                    tabIndex={0}
                    aria-label={`Fila ${index + 1} - Eliminar`}
                    className="btn border-0 delete-btn-glass"
                    title="Eliminar lámina"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', lineHeight: 1 }}>delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
