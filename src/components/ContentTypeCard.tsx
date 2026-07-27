import React from 'react'

interface ContentTypeCardProps {
  title: string
  description: string
  badgeText?: string
  iconName?: string
  onClick: () => void
}

export const ContentTypeCard: React.FC<ContentTypeCardProps> = ({
  title,
  description,
  badgeText = 'Disponible',
  iconName = 'view_carousel',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="glass-panel p-4 h-100 d-flex flex-column justify-content-between text-start"
      style={{
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)'
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.22)'
        e.currentTarget.style.boxShadow = '0 14px 40px rgba(0, 0, 0, 0.45)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'var(--glass-border)'
        e.currentTarget.style.boxShadow = 'var(--shadow-card)'
      }}
    >
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div
            className="d-flex align-items-center justify-content-center rounded-3 p-2"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              width: '44px',
              height: '44px',
              borderRadius: '14px',
            }}
          >
            <span className="material-symbols-outlined text-primary fs-4">
              {iconName}
            </span>
          </div>
          <span
            className="badge rounded-pill text-uppercase px-2.5 py-1"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: 'var(--text-secondary)',
              fontSize: '0.68rem',
              letterSpacing: '0.06em',
              fontWeight: 600,
            }}
          >
            {badgeText}
          </span>
        </div>

        <h3 className="h5 fw-bold mb-2" style={{ letterSpacing: '-0.01em' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
          {description}
        </p>
      </div>

      <div className="pt-3 d-flex align-items-center justify-content-between border-top" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Crear contenido</span>
        <span className="material-symbols-outlined fs-5 text-white-50">arrow_forward</span>
      </div>
    </div>
  )
}
