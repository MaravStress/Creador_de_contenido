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
        transition: 'all 0.25s ease-in-out',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'var(--glass-border)'
      }}
    >
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div
            className="d-flex align-items-center justify-content-center rounded-3 p-2"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              width: '44px',
              height: '44px',
            }}
          >
            <span className="material-symbols-outlined text-primary fs-4">
              {iconName}
            </span>
          </div>
          <span
            className="badge rounded-pill text-uppercase px-2 py-1"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: 'var(--text-secondary)',
              fontSize: '0.7rem',
              letterSpacing: '0.05em',
              fontWeight: 500,
            }}
          >
            {badgeText}
          </span>
        </div>

        <h3 className="h5 fw-bold mb-2">{title}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
          {description}
        </p>
      </div>

      <div className="pt-3 d-flex align-items-center justify-content-between border-top" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Crear nuevo</span>
        <span className="material-symbols-outlined fs-5">arrow_forward</span>
      </div>
    </div>
  )
}
