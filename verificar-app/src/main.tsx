import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Registrar el Service Worker de la PWA para la subcarpeta /verificar
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then(reg => {
        console.log('PWA Service Worker registrado con éxito. Scope:', reg.scope);
      })
      .catch(err => {
        console.error('Error al registrar PWA Service Worker:', err);
      });
  });
}
