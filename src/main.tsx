import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'

const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? ''
if (!GOOGLE_CLIENT_ID) {
  if (import.meta.env.PROD) {
    throw new Error('VITE_GOOGLE_CLIENT_ID is not set. Google sign-in will not work.')
  } else {
    console.warn('VITE_GOOGLE_CLIENT_ID is not set. Google sign-in will not work in this build.')
  }
}

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
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
)
