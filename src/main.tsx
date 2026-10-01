import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// global styles first, so component styles can override them
import './index.css'
import App from './App'

if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
