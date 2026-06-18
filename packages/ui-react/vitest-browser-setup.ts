/// <reference types="vite/client" />
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

import './src/styles/index.css'

afterEach(cleanup)
