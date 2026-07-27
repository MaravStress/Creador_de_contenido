import React, { useRef } from 'react'

interface EditorHeaderProps {
  onBack: () => void
  onExportPng: () => void
  onExportJson: () => void
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void
  onOpenSettings: () => void
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  onBack,
  onExportPng,
  onExportJson,
  onImportJson,
  onOpenSettings,
}) => {
  const jsonFileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 pb-3 border-bottom gap-3 flex-shrink-0" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
      <button
        onClick={onBack}
        className="btn text-light d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(12px)',
          fontSize: '0.85rem',
          fontWeight: 500,
        }}
      >
        <span className="material-symbols-outlined fs-5">arrow_back</span>
        Inicio
      </button>

      <div className="text-center">
        <span className="badge rounded-pill bg-white bg-opacity-10 text-white-50 px-3 py-1 mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
          FORMATO VERTICAL 1080 x 1350
        </span>
        <h2 className="h5 fw-bold m-0" style={{ letterSpacing: '-0.01em' }}>
          Carruseles: Esto No vs Esto Sí
        </h2>
      </div>

      {/* Action Controls */}
      <div className="d-flex align-items-center gap-2">
        <button
          onClick={onExportPng}
          className="flat-btn flat-btn-primary gap-2"
          title="Exportar todas las láminas a PNG"
        >
          <span className="material-symbols-outlined fs-5">download</span>
          Exportar PNG
        </button>

        <button
          onClick={() => jsonFileInputRef.current?.click()}
          className="icon-btn"
          title="Importar Proyecto JSON"
        >
          <span className="material-symbols-outlined fs-5">file_open</span>
        </button>
        <input
          type="file"
          ref={jsonFileInputRef}
          accept=".json"
          className="d-none"
          onChange={onImportJson}
        />

        <button
          onClick={onExportJson}
          className="icon-btn"
          title="Exportar Proyecto JSON"
        >
          <span className="material-symbols-outlined fs-5">save</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="icon-btn"
          title="Configuración de Estilos"
        >
          <span className="material-symbols-outlined fs-5">tune</span>
        </button>
      </div>
    </div>
  )
}
