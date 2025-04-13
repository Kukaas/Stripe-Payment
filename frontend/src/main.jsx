import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './components/ThemeContext'
import { Toaster } from 'sonner'
import { AuthProvider } from './lib/hooks/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <App />
        <Toaster position="top-center" richColors closeButton/>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
)
