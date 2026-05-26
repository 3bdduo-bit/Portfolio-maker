import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Disable right-click context menu
document.addEventListener('contextmenu', e => e.preventDefault())

// Disable F12 and common developer tools shortcuts
document.addEventListener('keydown', e => {
  if (
    e.key === 'F12' ||
    ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key.toLowerCase() === 'i' || e.key.toLowerCase() === 'j' || e.key.toLowerCase() === 'c')) ||
    ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u')
  ) {
    e.preventDefault()
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
