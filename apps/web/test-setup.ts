import { vi, expect } from 'vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import React from 'react'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Clean up after each test
afterEach(() => {
  cleanup()
})

// Mock all SVG imports
vi.mock('*.svg', () => {
  const MockedSVG = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) =>
    React.createElement('svg', { ...props, ref, 'data-testid': 'svg-mock' })
  )
  MockedSVG.displayName = 'MockedSVG'

  return {
    default: MockedSVG,
    ReactComponent: MockedSVG,
  }
})

// Mock Next.js components
vi.mock('next/image', () => ({
  default: React.forwardRef<HTMLImageElement, any>((props, ref) => {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', { ...props, ref })
  }),
}))

vi.mock('next/link', () => ({
  default: React.forwardRef<HTMLAnchorElement, any>(({ children, href, ...props }, ref) =>
    React.createElement('a', { ...props, href, ref }, children)
  ),
}))

// Mock CSS modules
vi.mock('*.module.css', () => ({
  default: {},
}))

vi.mock('*.module.scss', () => ({
  default: {},
}))