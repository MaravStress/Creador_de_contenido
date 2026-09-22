import { useState } from 'react'
import { HomeScreen } from './components/HomeScreen'
import { InstagramCarouselEditor } from './editors/InstagramCarouselEditor'
import { VideoEditor } from './editors/VideoEditor'
import { AudioCleanupEditor } from './editors/AudioCleanupEditor'
import { VideoMixEditor } from './editors/VideoMixEditor'

type ViewMode = 'home' | 'instagram-carousel' | 'video-editor' | 'audio-cleanup' | 'video-mix'

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('home')

  return (
    <main className="min-vh-100 d-flex flex-column">
      {currentView === 'home' && (
        <HomeScreen
          onSelectContentType={(type) => {
            if (type === 'instagram-carousel' || type === 'video-editor' || type === 'audio-cleanup' || type === 'video-mix') {
              setCurrentView(type as ViewMode)
            }
          }}
        />
      )}

      {currentView === 'instagram-carousel' && (
        <div className="flex-grow-1">
          <InstagramCarouselEditor
            onBack={() => setCurrentView('home')}
          />
        </div>
      )}

      {currentView === 'video-editor' && (
        <div className="flex-grow-1">
          <VideoEditor
            onBack={() => setCurrentView('home')}
          />
        </div>
      )}

      {currentView === 'audio-cleanup' && (
        <div className="flex-grow-1">
          <AudioCleanupEditor
            onBack={() => setCurrentView('home')}
          />
        </div>
      )}

      {currentView === 'video-mix' && (
        <div className="flex-grow-1">
          <VideoMixEditor
            onBack={() => setCurrentView('home')}
          />
        </div>
      )}
    </main>
  )
}
