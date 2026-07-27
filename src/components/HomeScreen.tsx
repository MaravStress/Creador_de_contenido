import React, { useState } from 'react'
import { ContentTypeCard } from './ContentTypeCard'
import { SettingsModal } from './SettingsModal'

interface HomeScreenProps {
  onSelectContentType: (type: string) => void
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectContentType }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  return (
    <div className="container py-5">
      {/* Header */}
      <header className="mb-5 d-flex justify-content-between align-items-start">
        <div className="text-start">
          <span
            className="text-uppercase fw-semibold px-3 py-1 rounded-pill d-inline-block mb-3"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              fontSize: '0.72rem',
              letterSpacing: '0.08em',
              color: 'var(--text-secondary)',
              border: '1px solid var(--glass-border)',
            }}
          >
            Creador de Contenido
          </span>
          <h1 className="display-5 fw-bold mb-2" style={{ letterSpacing: '-0.025em' }}>
            ¿Qué vas a crear hoy?
          </h1>
          <p className="lead" style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '580px' }}>
            Selecciona un tipo de formato para comenzar a diseñar y editar tus publicaciones con asistencia de Inteligencia Artificial.
          </p>
        </div>

        {/* Botón de Configuración (Apple Glass Circle) */}
        <button
          className="icon-btn"
          title="Configuración de APIs de IA"
          onClick={() => setIsSettingsOpen(true)}
        >
          <span className="material-symbols-outlined fs-5">settings</span>
        </button>
      </header>

      {/* Grid de Tarjetas */}
      <div className="row g-4">
        {/* Instagram Carousel (Activo) */}
        <div className="col-12 col-md-6 col-lg-4">
          <ContentTypeCard
            title="Carruseles de Instagram"
            description="Diseña secuencias comparativas 'Esto No vs Esto Sí' en formato vertical 4:5 asistidas por IA."
            badgeText="Disponible"
            iconName="view_carousel"
            onClick={() => onSelectContentType('instagram-carousel')}
          />
        </div>

        {/* Placeholders futuros */}
        <div className="col-12 col-md-6 col-lg-4 opacity-50">
          <ContentTypeCard
            title="Historias de Instagram"
            description="Crea plantillas verticales dinámicas e interactivas para tu contenido diario."
            badgeText="Próximamente"
            iconName="crop_portrait"
            onClick={() => {}}
          />
        </div>

        <div className="col-12 col-md-6 col-lg-4 opacity-50">
          <ContentTypeCard
            title="Hilos de X / Twitter"
            description="Redacta y visualiza publicaciones en secuencia optimizadas para lectura rápida."
            badgeText="Próximamente"
            iconName="chat"
            onClick={() => {}}
          />
        </div>
      </div>

      {/* Modal de Configuración */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  )
}
