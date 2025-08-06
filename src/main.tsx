import React from 'react'
import ReactDOM from 'react-dom/client'
import '@stack-spot/citric-icons/fill.css'
import '@stack-spot/citric-icons/social.css'
import '@stack-spot/citric-icons/outline.css'
import '@stack-spot/citric-react/citric.css'
import '@stack-spot/citric-react/theme.css'
import { App } from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
