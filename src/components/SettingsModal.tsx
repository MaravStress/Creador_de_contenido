import React, { useState, useEffect } from 'react'
import { testGeminiApiKey } from '../api'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [geminiApiKey, setGeminiApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  
  // Estado para la prueba de API
  const [isTesting, setIsTesting] = useState(false)
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [testMessage, setTestMessage] = useState('')

  useEffect(() => {
    if (isOpen) {
      const savedKey = localStorage.getItem('gemini_api_key') || ''
      setGeminiApiKey(savedKey)
      setIsSaved(false)
      setTestStatus('idle')
      setTestMessage('')
    }
  }, [isOpen])

  const handleTestApi = async () => {
    if (!geminiApiKey.trim()) {
      setTestStatus('error')
      setTestMessage('Por favor, ingresa una clave de API antes de probar.')
      return
    }

    setIsTesting(true)
    setTestStatus('idle')
    setTestMessage('')

    try {
      await testGeminiApiKey(geminiApiKey.trim())
      setTestStatus('success')
      setTestMessage('¡Conexión exitosa con la API de Gemini 2.5 Flash!')
    } catch (err: any) {
      setTestStatus('error')
      setTestMessage(err.message || 'Error de red o clave de API no válida.')
    } finally {
      setIsTesting(false)
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('gemini_api_key', geminiApiKey)
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
        className="glass-modal p-4 p-md-5 col-11 col-sm-9 col-md-6 col-lg-5 text-start position-relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
          <div className="d-flex align-items-center gap-2">
            <span className="material-symbols-outlined text-primary">settings</span>
            <h3 className="h5 fw-bold m-0">Configuración de IA</h3>
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
          <div className="mb-4">
            <label className="form-label d-flex justify-content-between align-items-center fw-medium" style={{ fontSize: '0.9rem' }}>
              <span>Clave de API de Gemini 2.5 Flash</span>
              <span className="badge rounded-pill bg-primary bg-opacity-20 text-primary px-2 py-1" style={{ fontSize: '0.7rem' }}>
                Google AI
              </span>
            </label>
            
            <div className="input-group">
              <input
                type={showKey ? 'text' : 'password'}
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
                  if (testStatus !== 'idle') setTestStatus('idle')
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
                onClick={() => setShowKey(!showKey)}
              >
                <span className="material-symbols-outlined fs-5">
                  {showKey ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>

            {/* Botón para Probar API y Mensaje de Estado */}
            <div className="d-flex justify-content-between align-items-center mt-2">
              <span className="form-text m-0" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Almacenada localmente en tu navegador.
              </span>

              <button
                type="button"
                onClick={handleTestApi}
                disabled={isTesting}
                className="btn btn-sm text-light border-0 px-3 py-1 rounded-3 d-flex align-items-center gap-1"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  fontSize: '0.8rem',
                  cursor: isTesting ? 'not-allowed' : 'pointer',
                }}
              >
                {isTesting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Probando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined fs-6">network_check</span>
                    Probar API
                  </>
                )}
              </button>
            </div>

            {/* Resultado de la prueba */}
            {testStatus === 'success' && (
              <div
                className="mt-3 p-3 rounded-3 d-flex align-items-center gap-2"
                style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  color: '#4ade80',
                  fontSize: '0.85rem',
                }}
              >
                <span className="material-symbols-outlined fs-5">check_circle</span>
                <span>{testMessage}</span>
              </div>
            )}

            {testStatus === 'error' && (
              <div
                className="mt-3 p-3 rounded-3 d-flex align-items-center gap-2"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: '0.85rem',
                }}
              >
                <span className="material-symbols-outlined fs-5">error</span>
                <span>{testMessage}</span>
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
