import React, { useState } from 'react'

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
        className="glass-modal p-4 p-md-5 col-11 col-sm-9 col-md-6 col-lg-5 text-start position-relative"
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
            Banco de Imágenes
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

        {/* Tab 2: Banco de Imágenes (Placeholder) */}
        {activeTab === 'stock' && (
          <div className="text-center py-5">
            <span className="material-symbols-outlined fs-1 text-secondary mb-2">image_search</span>
            <h5 className="fw-semibold mb-2">Buscador de Unsplash / Pexels</h5>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Esta función te permitirá buscar y usar fotos libres de derechos directamente desde la app.
            </p>
            <span className="badge bg-secondary bg-opacity-20 text-secondary px-3 py-1 rounded-pill mt-2">
              Próximamente
            </span>
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
          {activeTab === 'upload' && previewUrl && (
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
