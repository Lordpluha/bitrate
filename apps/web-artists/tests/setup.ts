import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// jsdom has no PointerEvent; Base UI builds one when a checkbox is activated.
window.PointerEvent ??=
  class PointerEvent extends MouseEvent {} as typeof window.PointerEvent

afterEach(cleanup)
