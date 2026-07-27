import React, { useState } from 'react'

interface InstagramCarouselEditorProps {
  onBack: () => void
}

export const InstagramCarouselEditor: React.FC<InstagramCarouselEditorProps> = ({ onBack }) => {
  const [slides, setSlides] = useState([
    { id: 1, title: 'Lámina 1', content: 'Portada del carrusel' },
    { id: 2, title: 'Lámina 2', content: 'Punto principal 1' },
    { id: 3, title: 'Lámina 3', content: 'Llamado a la acción (CTA)' },
  ])

  const [activeSlide, setActiveSlide] = useState(0)

  return (
    <div className="container py-4">
      {/* Navigation Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
        <button
          onClick={onBack}
          className="btn text-light d-flex align-items-center gap-2 px-3 py-2 rounded-3"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--glass-border)',
            fontSize: '0.9rem',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Volver al Inicio
        </button>

        <span className="fw-semibold fs-5">Editor de Carruseles de Instagram</span>

        <button className="flat-btn py-2 px-3 fs-6">
          Exportar
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className="row g-4">
        {/* Left Panel: Slide List / Options */}
        <div className="col-12 col-md-4 col-lg-3">
          <div className="glass-panel p-3 text-start">
            <h4 className="h6 text-uppercase fw-semibold mb-3" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
              Láminas ({slides.length})
            </h4>

            <div className="d-flex flex-column gap-2 mb-3">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  onClick={() => setActiveSlide(index)}
                  className="p-3 rounded-3 d-flex justify-content-between align-items-center"
                  style={{
                    cursor: 'pointer',
                    background: activeSlide === index ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid',
                    borderColor: activeSlide === index ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span className="fw-medium" style={{ fontSize: '0.95rem' }}>
                    {index + 1}. {slide.title}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                const newId = slides.length + 1
                setSlides([...slides, { id: newId, title: `Lámina ${newId}`, content: 'Nuevo contenido' }])
              }}
              className="w-100 py-2 rounded-3 text-light border-0"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px dashed var(--glass-border)',
                fontSize: '0.9rem',
              }}
            >
              + Agregar Lámina
            </button>
          </div>
        </div>

        {/* Center Canvas / Preview */}
        <div className="col-12 col-md-8 col-lg-9">
          <div className="glass-panel p-5 d-flex flex-column align-items-center justify-content-center min-vh-50">
            {/* Simulated 4:5 / 1:1 Instagram Post Canvas */}
            <div
              className="rounded-4 p-4 d-flex flex-column justify-content-center align-items-center text-center shadow-lg"
              style={{
                width: '320px',
                height: '400px',
                background: '#1a1a1a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'relative',
              }}
            >
              <span className="position-absolute top-0 end-0 m-3 badge rounded-pill bg-dark border" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                {activeSlide + 1} / {slides.length}
              </span>
              
              <h2 className="h4 fw-bold mb-3">{slides[activeSlide]?.title}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                {slides[activeSlide]?.content}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
