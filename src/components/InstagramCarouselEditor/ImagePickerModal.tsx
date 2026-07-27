import React, { useState, useEffect } from 'react'
import { searchUnsplashPhotos, getUnsplashApiKey, type UnsplashPhoto } from '../../api'

interface ImagePickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectImage: (imageUrl: string) => void
  currentImageUrl?: string
  title?: string
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  currentImageUrl = '',
  title = 'Seleccionar Imagen',
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'stock'>('upload')
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl)

  // Unsplash Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [unsplashPhotos, setUnsplashPhotos] = useState<UnsplashPhoto[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [unsplashError, setUnsplashError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setPreviewUrl(currentImageUrl)
      setUnsplashError('')
    }
  }, [isOpen, currentImageUrl])

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPreviewUrl(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSearchUnsplash = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!searchQuery.trim()) return

    const apiKey = getUnsplashApiKey()
    if (!apiKey) {
      setUnsplashError('No has configurado tu clave de API de Unsplash. Configúrala en el botón de ajustes ⚙️.')
      return
    }

    setIsSearching(true)
    setUnsplashError('')

    try {
      const response = await searchUnsplashPhotos(searchQuery.trim(), 1, 12)
      setUnsplashPhotos(response.results)
      if (response.results.length === 0) {
        setUnsplashError('No se encontraron imágenes para esta búsqueda.')
      }
    } catch (err: any) {
      setUnsplashError(err.message || 'Error al buscar en Unsplash.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectUnsplashPhoto = (photo: UnsplashPhoto) => {
    setPreviewUrl(photo.urls.regular)
  }

  const handleConfirm = () => {
    if (previewUrl) {
      onSelectImage(previewUrl)
      onClose()
    }
  }

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1060,
      }}
      onClick={onClose}
    >
      <div
        className="glass-modal p-4 p-md-5 col-11 col-sm-10 col-md-8 col-lg-6 text-start position-relative"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
          <h3 className="h5 fw-bold m-0 d-flex align-items-center gap-2">
            <span className="material-symbols-outlined text-primary">add_photo_alternate</span>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="btn btn-sm text-secondary d-flex align-items-center justify-content-center p-1 rounded-circle border-0"
            style={{ background: 'rgba(255, 255, 255, 0.05)' }}
          >
            <span className="material-symbols-outlined fs-5">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="d-flex gap-2 mb-4 p-1 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)' }}>
          <button
            className={`btn btn-sm flex-fill rounded-2 d-flex align-items-center justify-content-center gap-2 ${
              activeTab === 'upload' ? 'bg-primary text-white fw-semibold' : 'text-secondary border-0'
            }`}
            onClick={() => setActiveTab('upload')}
          >
            <span className="material-symbols-outlined fs-6">upload</span>
            Subir Imagen
          </button>
          <button
            className={`btn btn-sm flex-fill rounded-2 d-flex align-items-center justify-content-center gap-2 ${
              activeTab === 'stock' ? 'bg-primary text-white fw-semibold' : 'text-secondary border-0'
            }`}
            onClick={() => setActiveTab('stock')}
          >
            <span className="material-symbols-outlined fs-6">travel_explore</span>
            Unsplash Stock
          </button>
        </div>

        {/* Tab 1: Subir Imagen */}
        {activeTab === 'upload' && (
          <div className="text-center py-3">
            <div
              className="p-4 rounded-4 d-flex flex-column align-items-center justify-content-center border-dashed"
              style={{
                border: '2px dashed var(--glass-border)',
                background: 'rgba(255, 255, 255, 0.02)',
                minHeight: '180px',
                cursor: 'pointer',
              }}
              onClick={() => document.getElementById('image-file-input')?.click()}
            >
              {previewUrl ? (
                <div className="position-relative w-100 text-center">
                  <img
                    src={previewUrl}
                    alt="Vista previa"
                    className="img-fluid rounded-3 shadow"
                    style={{ maxHeight: '160px', objectFit: 'contain' }}
                  />
                  <p className="mt-2 mb-0 text-secondary" style={{ fontSize: '0.8rem' }}>
                    Haz clic para cambiar de imagen
                  </p>
                </div>
              ) : (
                <>
                  <span className="material-symbols-outlined fs-1 text-secondary mb-2">cloud_upload</span>
                  <p className="mb-1 fw-medium" style={{ fontSize: '0.95rem' }}>
                    Haz clic o arrastra una imagen aquí
                  </p>
                  <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
                    Soporta PNG, JPG, WEBP
                  </span>
                </>
              )}
            </div>

            <input
              id="image-file-input"
              type="file"
              accept="image/*"
              className="d-none"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Tab 2: Banco de Imágenes Unsplash */}
        {activeTab === 'stock' && (
          <div>
            <form onSubmit={handleSearchUnsplash} className="d-flex gap-2 mb-3">
              <input
                type="text"
                className="form-control text-light border-0 px-3 py-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                }}
                placeholder="Buscar en Unsplash (ej. tecnología, negocios)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                disabled={isSearching}
                className="flat-btn py-2 px-3 rounded-3 d-flex align-items-center gap-1"
                style={{ fontSize: '0.85rem' }}
              >
                {isSearching ? (
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                ) : (
                  <>
                    <span className="material-symbols-outlined fs-6">search</span>
                    Buscar
                  </>
                )}
              </button>
            </form>

            {unsplashError && (
              <div
                className="p-3 mb-3 rounded-3 text-center"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: '0.85rem',
                }}
              >
                {unsplashError}
              </div>
            )}

            {/* Grid de Fotos de Unsplash */}
            {unsplashPhotos.length > 0 && (
              <div className="row g-2 mb-3" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {unsplashPhotos.map((photo) => (
                  <div key={photo.id} className="col-4 col-sm-3">
                    <div
                      onClick={() => handleSelectUnsplashPhoto(photo)}
                      className={`position-relative rounded-3 overflow-hidden ${
                        previewUrl === photo.urls.regular ? 'ring-2 ring-primary border border-primary' : ''
                      }`}
                      style={{
                        height: '90px',
                        cursor: 'pointer',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: previewUrl === photo.urls.regular ? '2px solid #3b82f6' : '1px solid transparent',
                      }}
                    >
                      <img
                        src={photo.urls.small}
                        alt={photo.alt_description || 'Unsplash photo'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isSearching && unsplashPhotos.length === 0 && !unsplashError && (
              <div className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>
                <span className="material-symbols-outlined fs-2 mb-1">image_search</span>
                <p className="mb-0" style={{ fontSize: '0.85rem' }}>
                  Ingresa un término arriba para buscar fotografías gratuitas en alta resolución.
                </p>
              </div>
            )}

            {/* Vista previa seleccionada */}
            {previewUrl && (
              <div className="p-2 rounded-3 mb-2 d-flex align-items-center gap-3" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                <img
                  src={previewUrl}
                  alt="Seleccionada"
                  style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                />
                <span className="text-success fw-medium" style={{ fontSize: '0.85rem' }}>
                  ✓ Imagen seleccionada
                </span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="d-flex justify-content-end gap-2 pt-3 border-top mt-3" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
          <button
            type="button"
            className="btn btn-sm text-light border-0 px-3 py-2 rounded-3"
            style={{ background: 'rgba(255, 255, 255, 0.05)' }}
            onClick={onClose}
          >
            Cancelar
          </button>
          {previewUrl && (
            <button
              type="button"
              className="flat-btn py-2 px-4 rounded-3"
              style={{ fontSize: '0.9rem' }}
              onClick={handleConfirm}
            >
              Usar esta imagen
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
