import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App path={window.location.pathname} />
  </StrictMode>,
)

// Offline support (public/sw.js): pages and files already opened keep working without a connection.
// Only in the built site, so local development always runs fresh code.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => navigator.serviceWorker.ready)
      .then((registration) => {
        // Files this page loaded before the worker was running, so the first visit is saved too.
        setTimeout(() => {
          const files = performance
            .getEntriesByType('resource')
            .map((entry) => entry.name)
            .filter((href) => href.startsWith(location.origin))
          registration.active?.postMessage({ type: 'keep', page: location.pathname, files })
        }, 2000)
      })
      .catch(() => {
        // No offline support here (private mode, or an older browser): the site works as before.
      })
  })
}
