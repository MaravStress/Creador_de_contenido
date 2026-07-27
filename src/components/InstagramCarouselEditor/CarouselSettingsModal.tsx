import React from 'react'
import type { CarouselConfig } from '../../types/carousel'

interface CarouselSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  config: CarouselConfig
  onChangeConfig: (newConfig: CarouselConfig) => void
}

const GOOGLE_FONTS_LIST = [
  { name: 'Plus Jakarta Sans', family: 'Plus Jakarta Sans' },
  { name: 'Inter', family: 'Inter' },
  { name: 'Roboto', family: 'Roboto' },
  { name: 'Outfit', family: 'Outfit' },
  { name: 'Montserrat', family: 'Montserrat' },
  { name: 'Poppins', family: 'Poppins' },
  { name: 'Playfair Display', family: 'Playfair Display' },
  { name: 'Cinzel', family: 'Cinzel' },
]

export const CarouselSettingsModal: React.FC<CarouselSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
}) => {
  if (!isOpen) return null

  const handleFontChange = (fontFamily: string) => {
    const linkId = `google-font-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link')
      link.id = linkId
      link.rel = 'stylesheet'
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;600;700;800&display=swap`
      document.head.appendChild(link)
    }

    onChangeConfig({ ...config, fontFamily })
  }

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1060,
      }}
      onClick={onClose}
    >
      <div
        className="glass-modal p-4 p-md-5 col-11 col-sm-10 col-md-8 col-lg-6 text-start position-relative scrollbar-custom"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
          <h3 className="h5 fw-bold m-0 d-flex align-items-center gap-2">
            <span className="material-symbols-outlined text-primary">tune</span>
            Configuración de Lámina y Efectos
          </h3>
          <button
            onClick={onClose}
            className="btn btn-sm text-secondary d-flex align-items-center justify-content-center p-1 rounded-circle border-0"
            style={{ background: 'rgba(255, 255, 255, 0.05)' }}
          >
            <span className="material-symbols-outlined fs-5">close</span>
          </button>
        </div>

        {/* Tipografía Google Fonts */}
        <div className="mb-4">
          <label className="form-label fw-medium" style={{ fontSize: '0.9rem' }}>
            Fuente Tipográfica (Google Fonts)
          </label>
          <select
            className="form-select text-light border-0 px-3 py-2"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--glass-border)',
              fontSize: '0.9rem',
            }}
            value={config.fontFamily}
            onChange={(e) => handleFontChange(e.target.value)}
          >
            {GOOGLE_FONTS_LIST.map((font) => (
              <option key={font.family} value={font.family} style={{ background: '#1a1a1a', color: '#fff' }}>
                {font.name}
              </option>
            ))}
          </select>
        </div>

        {/* EFECTOS VISUALES: Viñeta y Sombra de Texto */}
        <h4 className="h6 text-uppercase fw-bold mt-4 mb-3 border-bottom pb-2" style={{ color: 'var(--text-secondary)', letterSpacing: '0.06em', borderColor: 'rgba(255, 255, 255, 0.08)' }}>
          Efectos Visuales en Imágenes y Texto
        </h4>

        <div className="row g-4 mb-4">
          {/* Intensidad de Viñeta */}
          <div className="col-12 col-md-6">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label fw-medium m-0" style={{ fontSize: '0.85rem' }}>
                Intensidad de Viñeta (Imágenes)
              </label>
              <span className="badge bg-white bg-opacity-10 text-light" style={{ fontSize: '0.75rem' }}>
                {Math.round((config.vignetteStrength ?? 0.65) * 100)}%
              </span>
            </div>
            <input
              type="range"
              className="form-range"
              min="0"
              max="1"
              step="0.05"
              value={config.vignetteStrength ?? 0.65}
              onChange={(e) => onChangeConfig({ ...config, vignetteStrength: parseFloat(e.target.value) })}
            />
          </div>

          {/* Sombra de Texto */}
          <div className="col-12 col-md-6">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label fw-medium m-0" style={{ fontSize: '0.85rem' }}>
                Desenfoque Sombra de Texto
              </label>
              <span className="badge bg-white bg-opacity-10 text-light" style={{ fontSize: '0.75rem' }}>
                {config.textShadowBlur ?? 12}px
              </span>
            </div>
            <input
              type="range"
              className="form-range"
              min="0"
              max="30"
              step="1"
              value={config.textShadowBlur ?? 12}
              onChange={(e) => onChangeConfig({ ...config, textShadowBlur: parseInt(e.target.value) })}
            />
          </div>
        </div>

        {/* LÍNEA CENTRAL SEPARADORA */}
        <h4 className="h6 text-uppercase fw-bold mt-4 mb-3 border-bottom pb-2" style={{ color: 'var(--text-secondary)', letterSpacing: '0.06em', borderColor: 'rgba(255, 255, 255, 0.08)' }}>
          Línea Blanca Central
        </h4>

        <div className="row g-4 mb-4">
          {/* Grosor de Línea Central */}
          <div className="col-12 col-md-6">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label fw-medium m-0" style={{ fontSize: '0.85rem' }}>
                Grosor de Línea Central
              </label>
              <span className="badge bg-white bg-opacity-10 text-light" style={{ fontSize: '0.75rem' }}>
                {config.dividerThickness ?? 4}px
              </span>
            </div>
            <input
              type="range"
              className="form-range"
              min="1"
              max="12"
              step="1"
              value={config.dividerThickness ?? 4}
              onChange={(e) => onChangeConfig({ ...config, dividerThickness: parseInt(e.target.value) })}
            />
          </div>

          {/* Color de Línea Central */}
          <div className="col-12 col-md-6">
            <label className="form-label fw-medium mb-1" style={{ fontSize: '0.85rem' }}>
              Color de Línea Central
            </label>
            <div className="d-flex gap-2 align-items-center">
              <input
                type="color"
                className="form-control form-control-color border-0 rounded-circle"
                style={{ width: '38px', height: '38px', padding: '2px', cursor: 'pointer' }}
                value={config.dividerColor ?? '#ffffff'}
                onChange={(e) => onChangeConfig({ ...config, dividerColor: e.target.value })}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{config.dividerColor ?? '#ffffff'}</span>
            </div>
          </div>
        </div>

        {/* Etiquetas de Sección */}
        <h4 className="h6 text-uppercase fw-bold mt-4 mb-3 border-bottom pb-2" style={{ color: 'var(--text-secondary)', letterSpacing: '0.06em', borderColor: 'rgba(255, 255, 255, 0.08)' }}>
          Encabezados de Tabla
        </h4>

        <div className="row g-3 mb-4">
          <div className="col-6">
            <label className="form-label fw-medium" style={{ fontSize: '0.85rem' }}>
              Texto "Esto No"
            </label>
            <input
              type="text"
              className="form-control text-light border-0 px-3 py-2"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--glass-border)',
                fontSize: '0.85rem',
              }}
              value={config.dontDoBadgeText}
              onChange={(e) => onChangeConfig({ ...config, dontDoBadgeText: e.target.value })}
            />
          </div>
          <div className="col-6">
            <label className="form-label fw-medium" style={{ fontSize: '0.85rem' }}>
              Texto "Esto Sí"
            </label>
            <input
              type="text"
              className="form-control text-light border-0 px-3 py-2"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--glass-border)',
                fontSize: '0.85rem',
              }}
              value={config.doInsteadBadgeText}
              onChange={(e) => onChangeConfig({ ...config, doInsteadBadgeText: e.target.value })}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="d-flex justify-content-end pt-3 border-top" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
          <button
            type="button"
            className="flat-btn py-2 px-4 rounded-3"
            style={{ fontSize: '0.9rem' }}
            onClick={onClose}
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  )
}
