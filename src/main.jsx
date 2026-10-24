import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/instrument-sans'
import './styles/tokens.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/pages.css'
import App from './App.jsx'
import { PropertiesProvider } from './context/PropertiesContext.jsx'
import { SavedProvider } from './context/SavedContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <PropertiesProvider>
        <SavedProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </SavedProvider>
      </PropertiesProvider>
    </BrowserRouter>
  </StrictMode>,
)
