import { KottsterApp } from '@kottster/react'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import '@kottster/react/dist/style.css'

const pageEntries = import.meta.glob('./pages/**/index.{jsx,tsx}', { eager: true })

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <KottsterApp pageEntries={pageEntries} />
  </StrictMode>,
)
