import React from 'react'
import { ContentTypeCard } from './ContentTypeCard'

interface HomeScreenProps {
  onSelectContentType: (type: string) => void
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectContentType }) => {
  return (
    <div className="container py-5">
      {/* Header */}
      <header className="mb-5 text-start">
        <span
          className="text-uppercase fw-semibold px-3 py-1 rounded-pill d-inline-block mb-2"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            color: 'var(--text-secondary)',
            border: '1px solid var(--glass-border)',
          }}
        >
          Creador de Contenido
        </span>
        <h1 className="display-5 fw-bold mb-2" style={{ letterSpacing: '-0.02em' }}>
          ¿Qué vas a crear hoy?
        </h1>
        <p className="lead" style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Selecciona un tipo de formato para comenzar a diseñar y editar tus publicaciones.
        </p>
      </header>

      {/* Grid de Tarjetas */}
      <div className="row g-4">
        {/* Instagram Carousel (Activo) */}
        <div className="col-12 col-md-6 col-lg-4">
          <ContentTypeCard
            title="Carruseles de Instagram"
            description="Diseña secuencias dinámicas de láminas para cautivar a tu audiencia en Instagram."
            badgeText="Disponible"
            onClick={() => onSelectContentType('instagram-carousel')}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            }
          />
        </div>

        {/* Próximamente / Placeholders para una interfaz más completa */}
        <div className="col-12 col-md-6 col-lg-4 opacity-50">
          <ContentTypeCard
            title="Historias de Instagram"
            description="Crea plantillas verticales dinámicas e interactivas para tu contenido diario."
            badgeText="Próximamente"
            onClick={() => {}}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F77737" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="3" ry="3"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
              </svg>
            }
          />
        </div>

        <div className="col-12 col-md-6 col-lg-4 opacity-50">
          <ContentTypeCard
            title="Hilos de X / Twitter"
            description="Redacta y visualiza publicaciones en secuencia optimizadas para lectura rápida."
            badgeText="Próximamente"
            onClick={() => {}}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1DA1F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
              </svg>
            }
          />
        </div>
      </div>
    </div>
  )
}
