import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PlaylistLoadError, PlaylistLoading } from './PlaylistLoadStates'

describe('playlist load states', () => {
  it('announces loading without presenting an error', () => {
    render(<PlaylistLoading />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading playlist')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('announces a load error and retries on request', () => {
    const onRetry = vi.fn()

    render(<PlaylistLoadError error={new Error('offline')} onRetry={onRetry} />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Unable to load playlist',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
