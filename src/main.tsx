import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App'
import { migrateProfileLocalStorage } from '@/lib/clearProfileStorage'
import { initTheme, ThemeProvider } from '@/lib/ThemeContext'
import '@/index.css'

initTheme()
migrateProfileLocalStorage()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
