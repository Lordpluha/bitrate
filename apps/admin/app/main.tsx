import { KottsterApp } from '@kottster/react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import '@kottster/react/dist/style.css'

const pageEntries = import.meta.glob('./pages/**/index.{jsx,tsx}', { eager: true })

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <KottsterApp pageEntries={pageEntries} />
  </React.StrictMode>,
)
