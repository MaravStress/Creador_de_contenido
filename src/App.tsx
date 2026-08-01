import { useState } from 'react'
import { HomeScreen } from './components/HomeScreen'
import { InstagramCarouselEditor } from './editors/InstagramCarouselEditor'
import { VideoEditor } from './editors/VideoEditor'

type ViewMode = 'home' | 'instagram-carousel' | 'video-editor'

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('home')

  return (
    <main className="min-vh-100">
      {currentView === 'home' && (
        <HomeScreen
          onSelectContentType={(type) => {
            if (type === 'instagram-carousel' || type === 'video-editor') {
              setCurrentView(type as ViewMode)
            }
          }}
        />
      )}

      {currentView === 'instagram-carousel' && (
        <InstagramCarouselEditor
          onBack={() => setCurrentView('home')}
        />
      )}

      {currentView === 'video-editor' && (
        <VideoEditor
          onBack={() => setCurrentView('home')}
        />
      )}
    </main>
  )
}
