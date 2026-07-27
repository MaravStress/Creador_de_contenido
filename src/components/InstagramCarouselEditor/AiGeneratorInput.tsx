import React from 'react'

interface AiGeneratorInputProps {
  topicInput: string
  onTopicInputChange: (value: string) => void
  onGenerate: (e: React.FormEvent) => void
  isGenerating: boolean
  error?: string
}

export const AiGeneratorInput: React.FC<AiGeneratorInputProps> = ({
  topicInput,
  onTopicInputChange,
  onGenerate,
  isGenerating,
  error,
}) => {
  return (
    <div className="pt-3 border-top flex-shrink-0" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
      <label className="form-label d-flex align-items-center gap-1.5 fw-semibold mb-2" style={{ fontSize: '0.85rem' }}>
        <span className="material-symbols-outlined text-primary fs-5">auto_awesome</span>
        Generar 4 láminas con Gemini AI
      </label>

      <form onSubmit={onGenerate}>
        <div className="input-group">
          <input
            type="text"
            className="form-control px-3 py-2 text-light"
            style={{ fontSize: '0.85rem', borderRadius: 'var(--radius-md) 0 0 var(--radius-md)' }}
            placeholder="Escribe una temática (ej. Fotografía de Retrato)..."
            value={topicInput}
            onChange={(e) => onTopicInputChange(e.target.value)}
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={isGenerating || !topicInput.trim()}
            className="flat-btn flat-btn-primary px-3"
            style={{ borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}
          >
            {isGenerating ? (
              <span className="spinner-border spinner-border-sm" role="status"></span>
            ) : (
              <span className="material-symbols-outlined fs-5">arrow_forward</span>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-2 text-danger" style={{ fontSize: '0.8rem' }}>
          {error}
        </div>
      )}
    </div>
  )
}
