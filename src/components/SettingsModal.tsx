import React, { useState, useEffect } from 'react'
import { testGeminiApiKey, testUnsplashApiKey } from '../api'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  // Gemini State
  const [geminiApiKey, setGeminiApiKey] = useState('')
  const [showGeminiKey, setShowGeminiKey] = useState(false)
  const [isTestingGemini, setIsTestingGemini] = useState(false)
  const [geminiTestStatus, setGeminiTestStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [geminiTestMessage, setGeminiTestMessage] = useState('')

  // Unsplash State
  const [unsplashApiKey, setUnsplashApiKey] = useState('')
  const [unsplashAppId, setUnsplashAppId] = useState('')
  const [unsplashSecretKey, setUnsplashSecretKey] = useState('')
  const [showUnsplashKey, setShowUnsplashKey] = useState(false)
  const [showUnsplashSecret, setShowUnsplashSecret] = useState(false)

  const [isTestingUnsplash, setIsTestingUnsplash] = useState(false)
  const [unsplashTestStatus, setUnsplashTestStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [unsplashTestMessage, setUnsplashTestMessage] = useState('')

  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setGeminiApiKey(localStorage.getItem('gemini_api_key') || '')
      setUnsplashApiKey(localStorage.getItem('unsplash_access_key') || '')
      setUnsplashAppId(localStorage.getItem('unsplash_app_id') || '')
      setUnsplashSecretKey(localStorage.getItem('unsplash_secret_key') || '')

      setIsSaved(false)
      setGeminiTestStatus('idle')
      setGeminiTestMessage('')
      setUnsplashTestStatus('idle')
      setUnsplashTestMessage('')
    }
  }, [isOpen])

  const handleTestGeminiApi = async () => {
    if (!geminiApiKey.trim()) {
      setGeminiTestStatus('error')
      setGeminiTestMessage('Por favor, ingresa una clave de API de Gemini antes de probar.')
      return
    }

    setIsTestingGemini(true)
    setGeminiTestStatus('idle')
    setGeminiTestMessage('')

    try {
      await testGeminiApiKey(geminiApiKey.trim())
      setGeminiTestStatus('success')
      setGeminiTestMessage('¡Conexión exitosa con la API de Gemini 2.5 Flash!')
    } catch (err: any) {
      setGeminiTestStatus('error')
      setGeminiTestMessage(err.message || 'Error de red o clave no válida.')
    } finally {
      setIsTestingGemini(false)
    }
  }

  const handleTestUnsplashApi = async () => {
    if (!unsplashApiKey.trim()) {
      setUnsplashTestStatus('error')
      setUnsplashTestMessage('Por favor, ingresa tu Access Key de Unsplash antes de probar.')
      return
    }

    setIsTestingUnsplash(true)
    setUnsplashTestStatus('idle')
    setUnsplashTestMessage('')

    try {
      await testUnsplashApiKey(unsplashApiKey.trim())
      setUnsplashTestStatus('success')
      setUnsplashTestMessage('¡Conexión exitosa con la API de Unsplash!')
    } catch (err: any) {
      setUnsplashTestStatus('error')
      setUnsplashTestMessage(err.message || 'Error de red o Access Key no válida.')
    } finally {
      setIsTestingUnsplash(false)
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('gemini_api_key', geminiApiKey)
    localStorage.setItem('unsplash_access_key', unsplashApiKey)
    localStorage.setItem('unsplash_app_id', unsplashAppId)
    localStorage.setItem('unsplash_secret_key', unsplashSecretKey)

    setIsSaved(true)
    setTimeout(() => {
      setIsSaved(false)
      onClose()
    }, 1200)
  }

  if (!isOpen) return null

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 1050,
      }}
      onClick={onClose}
    >
      <div
        className="glass-modal p-4 p-md-5 col-11 col-sm-10 col-md-8 col-lg-6 text-start position-relative"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
          <div className="d-flex align-items-center gap-2">
            <span className="material-symbols-outlined text-primary">settings</span>
            <h3 className="h5 fw-bold m-0">Configuración de Servicios y APIs</h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm text-secondary d-flex align-items-center justify-content-center p-1 rounded-circle border-0"
            style={{ background: 'rgba(255, 255, 255, 0.05)' }}
          >
            <span className="material-symbols-outlined fs-5">close</span>
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSave}>
          {/* Gemini API Section */}
          <div className="mb-4 pb-3 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
            <label className="form-label d-flex justify-content-between align-items-center fw-medium" style={{ fontSize: '0.9rem' }}>
              <span>Clave de API de Gemini 2.5 Flash</span>
              <span className="badge rounded-pill bg-primary bg-opacity-20 text-primary px-2 py-1" style={{ fontSize: '0.7rem' }}>
                Google AI
              </span>
            </label>
            
            <div className="input-group">
              <input
                type={showGeminiKey ? 'text' : 'password'}
                className="form-control text-light border-0 px-3 py-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '0.5rem 0 0 0.5rem',
                  fontSize: '0.9rem',
                }}
                placeholder="AIzaSy..."
                value={geminiApiKey}
                onChange={(e) => {
                  setGeminiApiKey(e.target.value)
                  if (geminiTestStatus !== 'idle') setGeminiTestStatus('idle')
                }}
              />
              <button
                type="button"
                className="btn btn-outline-secondary border-0 d-flex align-items-center px-3"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--glass-border)',
                  borderLeft: 'none',
                  borderRadius: '0 0.5rem 0.5rem 0',
                  color: 'var(--text-secondary)',
                }}
                onClick={() => setShowGeminiKey(!showGeminiKey)}
              >
                <span className="material-symbols-outlined fs-5">
                  {showGeminiKey ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-2">
              <span className="form-text m-0" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Almacenada localmente en tu navegador.
              </span>

              <button
                type="button"
                onClick={handleTestGeminiApi}
                disabled={isTestingGemini}
                className="btn btn-sm text-light border-0 px-3 py-1 rounded-3 d-flex align-items-center gap-1"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  fontSize: '0.8rem',
                  cursor: isTestingGemini ? 'not-allowed' : 'pointer',
                }}
              >
                {isTestingGemini ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Probando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined fs-6">network_check</span>
                    Probar Gemini
                  </>
                )}
              </button>
            </div>

            {geminiTestStatus === 'success' && (
              <div
                className="mt-2 p-2 px-3 rounded-3 d-flex align-items-center gap-2"
                style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  color: '#4ade80',
                  fontSize: '0.85rem',
                }}
              >
                <span className="material-symbols-outlined fs-5">check_circle</span>
                <span>{geminiTestMessage}</span>
              </div>
            )}

            {geminiTestStatus === 'error' && (
              <div
                className="mt-2 p-2 px-3 rounded-3 d-flex align-items-center gap-2"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: '0.85rem',
                }}
              >
                <span className="material-symbols-outlined fs-5">error</span>
                <span>{geminiTestMessage}</span>
              </div>
            )}
          </div>

          {/* Unsplash API Section */}
          <div className="mb-4">
            <label className="form-label d-flex justify-content-between align-items-center fw-medium mb-3" style={{ fontSize: '0.9rem' }}>
              <span>Credenciales de Unsplash</span>
              <span className="badge rounded-pill bg-info bg-opacity-20 text-info px-2 py-1" style={{ fontSize: '0.7rem' }}>
                Unsplash API
              </span>
            </label>

            {/* Application ID (Opcional) */}
            <div className="mb-3">
              <label className="form-label text-secondary" style={{ fontSize: '0.8rem' }}>
                Application ID (Opcional)
              </label>
              <input
                type="text"
                className="form-control text-light border-0 px-3 py-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                }}
                placeholder="ID numérico de tu aplicación..."
                value={unsplashAppId}
                onChange={(e) => setUnsplashAppId(e.target.value)}
              />
            </div>

            {/* Access Key (Obligatorio) */}
            <div className="mb-3">
              <label className="form-label fw-medium d-flex justify-content-between" style={{ fontSize: '0.8rem' }}>
                <span>Access Key (Requerida para búsquedas)</span>
                <span className="text-warning" style={{ fontSize: '0.75rem' }}>* Requerido</span>
              </label>
              <div className="input-group">
                <input
                  type={showUnsplashKey ? 'text' : 'password'}
                  className="form-control text-light border-0 px-3 py-2"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '0.5rem 0 0 0.5rem',
                    fontSize: '0.9rem',
                  }}
                  placeholder="Client-ID Access Key..."
                  value={unsplashApiKey}
                  onChange={(e) => {
                    setUnsplashApiKey(e.target.value)
                    if (unsplashTestStatus !== 'idle') setUnsplashTestStatus('idle')
                  }}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary border-0 d-flex align-items-center px-3"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--glass-border)',
                    borderLeft: 'none',
                    borderRadius: '0 0.5rem 0.5rem 0',
                    color: 'var(--text-secondary)',
                  }}
                  onClick={() => setShowUnsplashKey(!showUnsplashKey)}
                >
                  <span className="material-symbols-outlined fs-5">
                    {showUnsplashKey ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Secret Key (Opcional) */}
            <div className="mb-3">
              <label className="form-label text-secondary" style={{ fontSize: '0.8rem' }}>
                Secret Key (Opcional)
              </label>
              <div className="input-group">
                <input
                  type={showUnsplashSecret ? 'text' : 'password'}
                  className="form-control text-light border-0 px-3 py-2"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '0.5rem 0 0 0.5rem',
                    fontSize: '0.9rem',
                  }}
                  placeholder="Secret Key..."
                  value={unsplashSecretKey}
                  onChange={(e) => setUnsplashSecretKey(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary border-0 d-flex align-items-center px-3"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--glass-border)',
                    borderLeft: 'none',
                    borderRadius: '0 0.5rem 0.5rem 0',
                    color: 'var(--text-secondary)',
                  }}
                  onClick={() => setShowUnsplashSecret(!showUnsplashSecret)}
                >
                  <span className="material-symbols-outlined fs-5">
                    {showUnsplashSecret ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-2">
              <span className="form-text m-0" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                La Access Key se utiliza para autenticar la búsqueda de imágenes.
              </span>

              <button
                type="button"
                onClick={handleTestUnsplashApi}
                disabled={isTestingUnsplash}
                className="btn btn-sm text-light border-0 px-3 py-1 rounded-3 d-flex align-items-center gap-1"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  fontSize: '0.8rem',
                  cursor: isTestingUnsplash ? 'not-allowed' : 'pointer',
                }}
              >
                {isTestingUnsplash ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Probando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined fs-6">network_check</span>
                    Probar Unsplash
                  </>
                )}
              </button>
            </div>

            {unsplashTestStatus === 'success' && (
              <div
                className="mt-2 p-2 px-3 rounded-3 d-flex align-items-center gap-2"
                style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  color: '#4ade80',
                  fontSize: '0.85rem',
                }}
              >
                <span className="material-symbols-outlined fs-5">check_circle</span>
                <span>{unsplashTestMessage}</span>
              </div>
            )}

            {unsplashTestStatus === 'error' && (
              <div
                className="mt-2 p-2 px-3 rounded-3 d-flex align-items-center gap-2"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: '0.85rem',
                }}
              >
                <span className="material-symbols-outlined fs-5">error</span>
                <span>{unsplashTestMessage}</span>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="d-flex justify-content-end gap-2 pt-3 border-top" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
            <button
              type="button"
              className="btn btn-sm text-light border-0 px-3 py-2 rounded-3"
              style={{ background: 'rgba(255, 255, 255, 0.05)' }}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flat-btn py-2 px-4 rounded-3 d-flex align-items-center gap-2"
              style={{ fontSize: '0.9rem' }}
            >
              {isSaved ? (
                <>
                  <span className="material-symbols-outlined fs-5 text-success">check_circle</span>
                  Guardado
                </>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
