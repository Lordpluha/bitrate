import { brandFontVariables } from '@shared/fonts'
import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from './app/providers/AppProviders'
import { router } from './app/router/router'
import { applyStoredTheme } from './app/theme/applyStoredTheme'
import { NativeBridge } from './native/NativeBridge'

import './app/styles/global.css'

applyStoredTheme()
document.body.classList.add(brandFontVariables)

const root = document.getElementById('root')
if (!root) throw new Error('index.html is missing the #root element')

createRoot(root).render(
  <StrictMode>
    <AppProviders>
      <NativeBridge />
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
)
