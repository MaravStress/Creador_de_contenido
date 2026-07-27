import React, { useState, useRef } from 'react'
import { toPng } from 'html-to-image'
import type { CarouselSlide, CarouselConfig } from '../types/carousel'
import {
  EditorHeader,
  ControlTable,
  AiGeneratorInput,
  CarouselPreview,
  ImagePickerModal,
  CarouselSettingsModal,
} from '../components/InstagramCarouselEditor'
import { generateTextWithGemini } from '../api'
import '../styles/InstagramCarouselEditor.css'

interface InstagramCarouselEditorProps {
  onBack: () => void
}

const DEFAULT_CONFIG: CarouselConfig = {
  fontFamily: 'Plus Jakarta Sans',
  dontDoBadgeText: 'ESTO NO',
  doInsteadBadgeText: 'MEJOR HAZ ESTO',
  dontDoColor: '#ff453a',     // Apple System Red
  doInsteadColor: '#30d158',  // Apple System Green
  cardBgColor: '#121318',      // Deep Apple Surface
  textColor: '#ffffff',
  vignetteStrength: 0.65,     // 65% intensidad de viñeta
  textShadowBlur: 12,         // 12px desenfoque de sombra de texto
  dividerThickness: 4,        // 4px grosor de línea blanca central
  dividerColor: '#ffffff',    // Color blanco puro
}

const INITIAL_SLIDES: CarouselSlide[] = [
  {
    id: '1',
    dontDo: {
      text: 'Usar luz cenital directa que crea sombras marcadas bajo los ojos',
      imageUrl: '',
    },
    doInstead: {
      text: 'Usar luz suave rebotada o difusa en ángulo de 45 grados',
      imageUrl: '',
    },
  },
  {
    id: '2',
    dontDo: {
      text: 'Centrar el sujeto dejando espacio muerto arriba',
      imageUrl: '',
    },
    doInstead: {
      text: 'Aplicar la regla de tercios alineando los ojos en la línea superior',
      imageUrl: '',
    },
  },
]

export const InstagramCarouselEditor: React.FC<InstagramCarouselEditorProps> = ({ onBack }) => {
  const [slides, setSlides] = useState<CarouselSlide[]>(INITIAL_SLIDES)
  const [config, setConfig] = useState<CarouselConfig>(DEFAULT_CONFIG)
  const [topicInput, setTopicInput] = useState('')
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)
  const [aiError, setAiError] = useState('')

  // Modales
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [imageModalTarget, setImageModalTarget] = useState<{ slideId: string; field: 'dontDo' | 'doInstead' } | null>(null)

  // Referencias para exportación
  const slideRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Manejadores de tabla
  const handleUpdateText = (slideId: string, field: 'dontDo' | 'doInstead', text: string) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === slideId ? { ...s, [field]: { ...s[field], text } } : s))
    )
  }

  const handleUpdateImage = (imageUrl: string) => {
    if (!imageModalTarget) return
    const { slideId, field } = imageModalTarget
    setSlides((prev) =>
      prev.map((s) => (s.id === slideId ? { ...s, [field]: { ...s[field], imageUrl } } : s))
    )
    setImageModalTarget(null)
  }

  const handleAddRow = () => {
    const newSlide: CarouselSlide = {
      id: Date.now().toString(),
      dontDo: { text: 'Nuevo punto a evitar', imageUrl: '' },
      doInstead: { text: 'Nueva buena práctica', imageUrl: '' },
    }
    setSlides((prev) => [...prev, newSlide])
  }

  const handleDeleteRow = (slideId: string) => {
    if (slides.length <= 1) return
    setSlides((prev) => prev.filter((s) => s.id !== slideId))
  }

  // Generación con IA (Gemini 2.5 Flash)
  const handleGenerateFromAi = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topicInput.trim()) return

    setIsGeneratingAi(true)
    setAiError('')

    const prompt = `Actúa como un experto en creación de contenido para redes sociales. 
Genera exactamente 4 pares comparativos para la temática "${topicInput.trim()}" usando el formato "No hagas esto, mejor haz esto".
Responde ÚNICAMENTE con un arreglo JSON válido en el siguiente formato, sin texto ni formato adicional fuera del JSON:
[
  { "dontDo": "descripción concisa de lo que no debe hacer", "doInstead": "descripción concisa de la solución o buena práctica" },
  ...
]`

    try {
      const responseText = await generateTextWithGemini(prompt)
      const cleanJsonStr = responseText.replace(/```json/gi, '').replace(/```/g, '').trim()
      const parsedArray = JSON.parse(cleanJsonStr)

      if (Array.isArray(parsedArray) && parsedArray.length > 0) {
        const newSlides: CarouselSlide[] = parsedArray.map((item: any, index: number) => ({
          id: `${Date.now()}-${index}`,
          dontDo: { text: item.dontDo || item.noHagasEsto || '', imageUrl: '' },
          doInstead: { text: item.doInstead || item.mejorHazEsto || '', imageUrl: '' },
        }))

        setSlides(newSlides)
        setTopicInput('')
      } else {
        throw new Error('La respuesta recibida no contiene una lista válida.')
      }
    } catch (err: any) {
      setAiError(err.message || 'No se pudieron generar los datos con Gemini.')
    } finally {
      setIsGeneratingAi(false)
    }
  }

  // Importar / Exportar JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ config, slides }, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `carrusel-${Date.now()}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string)
          if (imported.slides && Array.isArray(imported.slides)) {
            setSlides(imported.slides)
            if (imported.config) setConfig(imported.config)
          }
        } catch (err) {
          alert('Archivo JSON inválido o corrupto.')
        }
      }
      reader.readAsText(file)
    }
  }

  // Exportar PNG
  const handleExportPng = async () => {
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i]
      const node = slideRefs.current[slide.id]
      if (node) {
        try {
          const dataUrl = await toPng(node, { quality: 0.98, pixelRatio: 3 })
          const link = document.createElement('a')
          link.download = `carrusel-lamina-${i + 1}.png`
          link.href = dataUrl
          link.click()
        } catch (err) {
          console.error(`Error al exportar lámina ${i + 1}:`, err)
        }
      }
    }
  }

  return (
    <div className="d-flex flex-column vh-100 px-4 py-3 overflow-hidden">
      {/* Header Bar */}
      <EditorHeader
        onBack={onBack}
        onExportPng={handleExportPng}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Full-Height Workspace Grid */}
      <div className="row g-4 flex-grow-1 overflow-hidden align-items-stretch mb-2">
        {/* Left Panel: Control Table & AI Generator */}
        <div className="col-12 pb-4 col-xl-5 col-xxl-4 h-100">
          <div className="glass-panel p-4 text-start h-100 d-flex flex-column overflow-hidden">
            <ControlTable
              slides={slides}
              config={config}
              onUpdateText={handleUpdateText}
              onOpenImageModal={(slideId, field) => setImageModalTarget({ slideId, field })}
              onAddRow={handleAddRow}
              onDeleteRow={handleDeleteRow}
            />
            <AiGeneratorInput
              topicInput={topicInput}
              onTopicInputChange={setTopicInput}
              onGenerate={handleGenerateFromAi}
              isGenerating={isGeneratingAi}
              error={aiError}
            />
          </div>
        </div>

        {/* Right Area: Carousel Preview */}
        <CarouselPreview
          slides={slides}
          config={config}
          slideRefs={slideRefs}
        />
      </div>

      {/* Modales */}
      <ImagePickerModal
        isOpen={!!imageModalTarget}
        onClose={() => setImageModalTarget(null)}
        onSelectImage={handleUpdateImage}
        currentImageUrl={
          imageModalTarget
            ? slides.find((s) => s.id === imageModalTarget.slideId)?.[imageModalTarget.field].imageUrl
            : ''
        }
      />

      <CarouselSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onChangeConfig={setConfig}
      />
    </div>
  )
}
