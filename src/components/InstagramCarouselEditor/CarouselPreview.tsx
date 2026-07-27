import React, { useRef } from 'react'
import type { CarouselSlide, CarouselConfig } from '../../types/carousel'
import { CarouselSlideCard } from './CarouselSlideCard'

interface CarouselPreviewProps {
  slides: CarouselSlide[]
  config: CarouselConfig
  slideRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>
  isExporting?: boolean
}

export const CarouselPreview: React.FC<CarouselPreviewProps> = ({
  slides,
  config,
  slideRefs,
  isExporting = false,
}) => {
  const previewTrackRef = useRef<HTMLDivElement>(null)

  const handleHorizontalWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (previewTrackRef.current && e.deltaY !== 0) {
      previewTrackRef.current.scrollLeft += e.deltaY * 1.2
    }
  }

  return (
    <div className="col-12 col-xl-7 col-xxl-8 h-100 d-flex flex-column justify-content-center overflow-hidden text-start">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-shrink-0 px-2">
        <h3 className="h6 text-uppercase fw-bold m-0" style={{ letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>
          Previsualización del Carrusel (4:5)
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
          Desliza horizontalmente para navegar
        </span>
      </div>

      {/* Horizontal Track (Centered in clean workspace with mouse wheel horizontal scroll) */}
      <div
        ref={previewTrackRef}
        onWheel={handleHorizontalWheel}
        className="d-flex gap-4 overflow-auto py-3 px-2 scrollbar-custom align-items-center flex-grow-1"
      >
        {slides.map((slide, index) => (
          <CarouselSlideCard
            key={slide.id}
            slide={slide}
            index={index}
            totalSlides={slides.length}
            config={config}
            isExporting={isExporting}
            cardRef={(el) => (slideRefs.current[slide.id] = el)}
          />
        ))}
      </div>
    </div>
  )
}
