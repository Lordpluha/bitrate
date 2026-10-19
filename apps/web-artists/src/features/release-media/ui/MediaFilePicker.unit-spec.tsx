import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MediaFilePicker } from './MediaFilePicker'

const cover = new File(['png'], 'cover.png', { type: 'image/png' })

const renderPicker = (disabled = false) => {
  const onChange = vi.fn()
  render(
    <MediaFilePicker
      accept="image/png"
      disabled={disabled}
      file={null}
      hint="PNG up to 20 MB."
      label="Artwork image"
      onChange={onChange}
      problem={null}
    />,
  )
  return onChange
}

const dropOn = (target: HTMLElement, files: File[]) => {
  fireEvent.dragOver(target, { dataTransfer: { files, types: ['Files'] } })
  fireEvent.drop(target, { dataTransfer: { files, types: ['Files'] } })
}

describe('MediaFilePicker', () => {
  it('passes a file dropped on it to onChange, like choosing one', () => {
    const onChange = renderPicker()

    dropOn(screen.getByRole('button', { name: 'Choose file' }), [cover])

    expect(onChange).toHaveBeenCalledWith(cover)
  })

  it('ignores drops while disabled', () => {
    const onChange = renderPicker(true)

    dropOn(screen.getByRole('button', { name: 'Choose file' }), [cover])

    expect(onChange).not.toHaveBeenCalled()
  })

  it('tells the artist a file can be dropped', () => {
    renderPicker()

    expect(screen.getByText(/drop a file here/i)).toBeInTheDocument()
  })
})
