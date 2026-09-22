import React from 'react'
import { useAudioQueue } from '../hooks/useAudioQueue'
import { TrackListPanel } from '../components/audiocleanup/TrackListPanel'
import { ProcessingConfigPanel } from '../components/audiocleanup/ProcessingConfigPanel'

interface AudioCleanupEditorProps {
  onBack: () => void
}

export const AudioCleanupEditor: React.FC<AudioCleanupEditorProps> = ({ onBack }) => {
  const {
    tracks,
    selectedTrackId,
    activeModel,
    currentSettings,
    isProcessing,
    queueLength,
    selectTrack,
    selectModel,
    updateSettings,
    addTrack,
    removeTrack,
    processTrack,
    getProcessedBuffer,
  } = useAudioQueue()

  // Handle adding files (audio or video)
  const handleAddTracks = async (files: File[]) => {
    for (const file of files) {
      const fileType = file.type
      const isVideo = fileType.startsWith('video/')
      const isAudio = fileType.startsWith('audio/')

      if (!isVideo && !isAudio) {
        continue // Skip unsupported files
      }

      try {
        const arrayBuffer = await file.arrayBuffer()
        
        let audioBuffer: AudioBuffer | null = null
        
        if (isVideo) {
          // Extract audio from video using AudioContext
          audioBuffer = await decodeAudioFromVideo(arrayBuffer)
        } else {
          // Decode audio file directly
          audioBuffer = await decodeAudioFile(arrayBuffer)
        }

        if (audioBuffer) {
          addTrack({
            id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            duration: audioBuffer.duration,
            originalType: isVideo ? 'video' : 'audio',
            rawAudioBuffer: audioBuffer,
            settings: currentSettings,
          })
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
      }
    }
  }

  // Helper: Decode audio from video file
  async function decodeAudioFromVideo(arrayBuffer: ArrayBuffer): Promise<AudioBuffer | null> {
    const audioContext = new AudioContext()
    try {
      return await audioContext.decodeAudioData(arrayBuffer.slice(0))
    } catch (error) {
      console.error('Error decoding video audio:', error)
      return null
    }
  }

  // Helper: Decode audio file
  async function decodeAudioFile(arrayBuffer: ArrayBuffer): Promise<AudioBuffer | null> {
    const audioContext = new AudioContext()
    try {
      return await audioContext.decodeAudioData(arrayBuffer.slice(0))
    } catch (error) {
      console.error('Error decoding audio file:', error)
      return null
    }
  }

  return (
    <div className="h-100 d-flex flex-column">
      {/* Header */}
      <header
        className="px-4 py-3 d-flex align-items-center justify-content-between"
        style={{
          borderBottom: '1px solid var(--glass-border)',
          backgroundColor: 'var(--glass-bg)',
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <button
            className="icon-btn"
            title="Volver al inicio"
            onClick={onBack}
          >
            <span className="material-symbols-outlined fs-5">arrow_back</span>
          </button>
          <div className="text-start">
            <span
              className="text-uppercase fw-semibold px-3 py-1 rounded-pill d-inline-block mb-1"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                fontSize: '0.72rem',
                letterSpacing: '0.08em',
                color: 'var(--text-secondary)',
                border: '1px solid var(--glass-border)',
              }}
            >
              Limpieza de Audio
            </span>
            <h2 className="fw-bold mb-0 fs-6" style={{ letterSpacing: '-0.02em' }}>
              Editor de Audio
            </h2>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          {queueLength > 0 && (
            <span
              className="badge rounded-pill"
              style={{
                backgroundColor: 'rgba(10,132,255,0.2)',
                color: 'var(--apple-blue)',
                fontSize: '0.75rem',
              }}
            >
              {queueLength} en cola
            </span>
          )}
        </div>
      </header>

      {/* Main Content — Two Panels */}
      <div className="flex-grow-1 d-flex" style={{ overflow: 'hidden' }}>
        {/* Left Panel — Track List (20%) */}
        <div style={{ width: '20%', minWidth: '250px', maxWidth: '350px' }}>
          <TrackListPanel
            tracks={tracks}
            selectedTrackId={selectedTrackId}
            isProcessing={isProcessing}
            queueLength={queueLength}
            onSelectTrack={selectTrack}
            onRemoveTrack={removeTrack}
            onAddTracks={handleAddTracks}
          />
        </div>

        {/* Right Panel — Processing Config (80%) */}
        <div style={{ flex: 1 }}>
          <ProcessingConfigPanel
            tracks={tracks}
            selectedTrackId={selectedTrackId}
            activeModel={activeModel}
            currentSettings={currentSettings}
            isProcessing={isProcessing}
            onSelectModel={selectModel}
            updateSettings={updateSettings}
            processTrack={processTrack}
            getProcessedBuffer={getProcessedBuffer}
          />
        </div>
      </div>
    </div>
  )
}