import React from 'react'

interface ContentTypeCardProps {
  title: string
  description: string
  badgeText?: string
  icon?: React.ReactNode
  onClick: () => void
}

export const ContentTypeCard: React.FC<ContentTypeCardProps> = ({
  title,
  description,
  badgeText = 'Disponible',
  icon,
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
              width: '42px',
              height: '42px',
            }}
          >
            {icon || (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            )}
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
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </div>
    </div>
  )
}
