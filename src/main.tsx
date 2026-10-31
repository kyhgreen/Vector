import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import '@fontsource/m-plus-rounded-1c/latin-400.css'
import '@fontsource/m-plus-rounded-1c/latin-500.css'
import '@fontsource/m-plus-rounded-1c/latin-700.css'
import './styles/tokens.css'
import './styles/base.css'
import App from './App'

// Offline support: caches the app so it opens with no internet, and quietly
// updates itself when a new version is published.
registerSW({ immediate: true })

// Progress is saved on the device only, so ask the browser not to clear it
// when storage runs low.
navigator.storage?.persist?.().catch(() => {})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
