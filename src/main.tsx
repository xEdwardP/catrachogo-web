import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthProvider'
import { ThemeProvider } from './context/ThemeProvider'
import { AppProviders } from './components/AppProviders'
import { GoogleMapsProvider } from './components/GoogleMapsProvider'
import { PayPalProvider } from './components/PayPalProvider'
import { useTheme } from './hooks/useTheme'

function ThemedToaster() {
  const { theme } = useTheme()
  return <Toaster richColors position="top-center" theme={theme} />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppProviders>
            <GoogleMapsProvider>
              <PayPalProvider>
                <App />
              </PayPalProvider>
            </GoogleMapsProvider>
          </AppProviders>
          <ThemedToaster />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
