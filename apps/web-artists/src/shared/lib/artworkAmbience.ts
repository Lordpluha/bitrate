import { useEffect } from 'react'
import { pickPalette } from './palette'

/** The edge of the square the artwork is scaled to before sampling. */
const SAMPLE_SIZE = 32
const PROPERTIES = ['--artist-cover-1', '--artist-cover-2', '--artist-cover-3']

async function samplePalette(url: string, signal: AbortSignal) {
  const image = new Image()
  // The API serves artwork with CORS, so the canvas stays readable.
  image.crossOrigin = 'anonymous'
  image.decoding = 'async'
  image.src = url
  await image.decode()
  if (signal.aborted) return []
  const canvas = document.createElement('canvas')
  canvas.width = SAMPLE_SIZE
  canvas.height = SAMPLE_SIZE
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return []
  context.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE)
  return pickPalette(context.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE).data)
}

/**
 * Tints the workspace backdrop with the artwork's dominant colours while the caller is
 * mounted. Without artwork, or when it cannot be read, the brand colours stay.
 */
export function useArtworkAmbience(url: string | null) {
  useEffect(() => {
    if (!url) return
    const root = document.documentElement
    const controller = new AbortController()
    const apply = async () => {
      try {
        const colors = await samplePalette(url, controller.signal)
        const [first] = colors
        if (controller.signal.aborted || !first) return
        for (const [index, property] of PROPERTIES.entries())
          root.style.setProperty(property, colors[index] ?? first)
        root.dataset.ambient = 'artwork'
      } catch {
        // Artwork that cannot be decoded keeps the brand colours.
      }
    }
    void apply()
    return () => {
      controller.abort()
      delete root.dataset.ambient
      for (const property of PROPERTIES) root.style.removeProperty(property)
    }
  }, [url])
}
