import { expect, test, vi } from 'vitest'

// Mock the Landing component to avoid complex dependency issues
vi.mock('@views/Landing', () => ({
  Landing: () => <div>Discover a World of Music</div>
}))

test('Page renders correctly', async () => {
  const { default: Page } = await import('../app/(landing)/page')
  const { render, screen } = await import('@testing-library/react')

  render(<Page />)

  // Check if the component renders without crashing
  expect(screen.getByText(/Discover/i)).toBeDefined()
})
