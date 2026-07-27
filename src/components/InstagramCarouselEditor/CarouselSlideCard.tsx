import React from 'react'
import type { CarouselSlide, CarouselConfig } from '../../types/carousel'

interface CarouselSlideCardProps {
  slide: CarouselSlide
  index: number
  totalSlides: number
  config: CarouselConfig
  cardRef: (el: HTMLDivElement | null) => void
}

export const CarouselSlideCard: React.FC<CarouselSlideCardProps> = ({
  slide,
  index,
  totalSlides,
  config,
  cardRef,
}) => {
  // Estilo de sombra de texto configurable
  const textShadowStyle = {
    textShadow: `0 3px ${config.textShadowBlur}px rgba(0, 0, 0, 0.95), 0 1px 3px rgba(0, 0, 0, 0.9)`,
  }

  return (
    <div
      ref={cardRef}
      className="carousel-card-split"
      style={{
        backgroundColor: config.cardBgColor,
        color: config.textColor,
        fontFamily: `'${config.fontFamily}', sans-serif`,
      }}
    >
      {/* Contador de lámina estilo cristal */}
      <span className="carousel-counter-badge">
        {index + 1} / {totalSlides}
      </span>

      {/* 1. SECCIÓN SUPERIOR: Imagen Arriba + Texto Overlay Arriba */}
      <div className="carousel-half-section">
        {/* Imagen de fondo superior */}
        {slide.dontDo.imageUrl ? (
          <img src={slide.dontDo.imageUrl} alt="" className="carousel-bg-image" />
        ) : (
          <div
            className="carousel-bg-image d-flex align-items-center justify-content-center"
            style={{ background: 'linear-gradient(135deg, #1f222e 0%, #111218 100%)' }}
          >
            <span className="material-symbols-outlined text-secondary opacity-25 fs-1">add_photo_alternate</span>
          </div>
        )}

        {/* Capa de Viñeta Configurable */}
        <div
          className="carousel-vignette-overlay"
          style={{ opacity: config.vignetteStrength }}
        ></div>

        {/* Texto de Arriba */}
        <p className="carousel-overlay-text" style={textShadowStyle}>
          {slide.dontDo.text || 'Sin texto...'}
        </p>
      </div>

      {/* 3. LÍNEA BLANCA EN EL CENTRO (Grosor y Color Configurable) */}
      <div
        className="carousel-divider-line"
        style={{
          height: `${config.dividerThickness}px`,
          backgroundColor: config.dividerColor,
        }}
      ></div>

      {/* 2 & 4 & 5. SECCIÓN INFERIOR: Imagen Abajo + Texto Overlay Abajo */}
      <div className="carousel-half-section">
        {/* Imagen de fondo inferior */}
        {slide.doInstead.imageUrl ? (
          <img src={slide.doInstead.imageUrl} alt="" className="carousel-bg-image" />
        ) : (
          <div
            className="carousel-bg-image d-flex align-items-center justify-content-center"
            style={{ background: 'linear-gradient(135deg, #181a24 0%, #0d0e14 100%)' }}
          >
            <span className="material-symbols-outlined text-secondary opacity-25 fs-1">add_photo_alternate</span>
          </div>
        )}

        {/* Capa de Viñeta Configurable */}
        <div
          className="carousel-vignette-overlay"
          style={{ opacity: config.vignetteStrength }}
        ></div>

        {/* Texto de Abajo */}
        <p className="carousel-overlay-text" style={textShadowStyle}>
          {slide.doInstead.text || 'Sin texto...'}
        </p>
      </div>
    </div>
  )
}
