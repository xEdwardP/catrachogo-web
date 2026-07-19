import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthProvider'
import { AppProviders } from './components/AppProviders'
import { GoogleMapsProvider } from './components/GoogleMapsProvider'
import { PayPalProvider } from './components/PayPalProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppProviders>
          <GoogleMapsProvider>
            <PayPalProvider>
              <App />
            </PayPalProvider>
          </GoogleMapsProvider>
        </AppProviders>
        <Toaster richColors position="top-center" />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
