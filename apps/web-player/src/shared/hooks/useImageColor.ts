import { useEffect, useState } from 'react'

type RGB = [number, number, number]

function extractDominantColor(img: HTMLImageElement): RGB {
  try {
    const SIZE = 80
    const canvas = document.createElement('canvas')
    canvas.width = SIZE
    canvas.height = SIZE
    const ctx = canvas.getContext('2d')
    if (!ctx) return [20, 20, 20]

    ctx.drawImage(img, 0, 0, SIZE, SIZE)
    const { data } = ctx.getImageData(0, 0, SIZE, SIZE)

    type Bucket = { r: number; g: number; b: number; count: number }
    const buckets = new Map<string, Bucket>()

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] ?? 0
      const g = data[i + 1] ?? 0
      const b = data[i + 2] ?? 0
      const brightness = (r + g + b) / 3
      if (brightness < 25 || brightness > 220) continue

      const qr = Math.floor(r / 32) * 32
      const qg = Math.floor(g / 32) * 32
      const qb = Math.floor(b / 32) * 32
      const key = `${qr},${qg},${qb}`

      const bucket = buckets.get(key) ?? { r: 0, g: 0, b: 0, count: 0 }
      bucket.r += r
      bucket.g += g
      bucket.b += b
      bucket.count++
      buckets.set(key, bucket)
    }

    if (buckets.size === 0) return [20, 20, 20]

    let bestR = 20, bestG = 20, bestB = 20, bestScore = 0

    for (const bucket of buckets.values()) {
      const r = bucket.r / bucket.count
      const g = bucket.g / bucket.count
      const b = bucket.b / bucket.count
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const saturation = max === 0 ? 0 : (max - min) / max
      const score = bucket.count * (1 + saturation * 3)
      if (score > bestScore) {
        bestScore = score
        bestR = r
        bestG = g
        bestB = b
      }
    }

    return [Math.round(bestR * 0.5), Math.round(bestG * 0.5), Math.round(bestB * 0.5)]
  } catch {
    return [20, 20, 20]
  }
}

function tryLoad(src: string, crossOrigin: boolean): Promise<RGB> {
  return new Promise((resolve) => {
    const img = new Image()
    if (crossOrigin) img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        resolve(extractDominantColor(img))
      } catch {
        resolve([20, 20, 20])
      }
    }
    img.onerror = () => resolve([20, 20, 20])
    img.src = src
  })
}

/**
 * Extracts dominant color from an image URL.
 * First tries with crossOrigin (for CORS-enabled servers),
 * then falls back to a CSS-based hue estimation using a tiny canvas trick.
 */
export function useImageColor(src: string | undefined): RGB {
  const [color, setColor] = useState<RGB>([20, 20, 20])

  useEffect(() => {
    if (!src) return
    let cancelled = false

    // Попытка 1: с crossOrigin (нужны CORS-заголовки на сервере)
    tryLoad(src, true).then((rgb) => {
      if (cancelled) return
      // Если цвет извлечь не удалось (дефолтный) — пробуем без crossOrigin
      // (изображение может быть в кэше браузера)
      if (rgb[0] === 20 && rgb[1] === 20 && rgb[2] === 20) {
        return tryLoad(src, false)
      }
      setColor(rgb)
      return undefined
    }).then((rgb) => {
      if (rgb && !cancelled) setColor(rgb)
    })

    return () => { cancelled = true }
  }, [src])

  return color
}
