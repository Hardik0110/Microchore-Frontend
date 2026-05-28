import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

;(() => {
  try {
    const stored = window.localStorage.getItem('microchore:theme')
    const mode = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
    const resolved =
      mode === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : mode
    document.documentElement.classList.toggle('dark', resolved === 'dark')
  } catch { }
})()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
