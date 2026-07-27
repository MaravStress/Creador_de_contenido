import { useState } from 'react'
import { HomeScreen } from './components/HomeScreen'
import { InstagramCarouselEditor } from './editors/InstagramCarouselEditor'

type ViewMode = 'home' | 'instagram-carousel'

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('home')

  return (
    <main className="min-vh-100">
      {currentView === 'home' && (
        <HomeScreen
          onSelectContentType={(type) => {
            if (type === 'instagram-carousel') {
              setCurrentView('instagram-carousel')
            }
          }}
        />
      )}

      {currentView === 'instagram-carousel' && (
        <InstagramCarouselEditor
          onBack={() => setCurrentView('home')}
        />
      )}
    </main>
  )
}
