'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'

type DeviceScreenProps = {
  /** The width the content is laid out at, in CSS pixels (a phone is 390). */
  width: number
  children: ReactNode
}

/**
 * Lays real mobile UI out at a real device width and scales it down to fit its frame, so
 * components built for a 390px phone (the island, the sidebar) keep their own proportions
 * instead of being squeezed into a narrower box. It uses CSS `zoom` so text stays crisp.
 */
export const DeviceScreen = ({ width, children }: DeviceScreenProps) => {
  const box = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState({ scale: 1, height: 0 })

  useEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => {
      const scale = el.clientWidth / width || 1
      setFit({ scale, height: el.clientHeight / scale })
    }
    measure()
    const watch = new ResizeObserver(measure)
    watch.observe(el)
    return () => watch.disconnect()
  }, [width])

  return (
    <div className="relative h-full w-full overflow-hidden" ref={box}>
      <div
        className="absolute top-0 left-0"
        style={{
          width,
          height: fit.height || undefined,
          /* zoom, not a scale transform: text is laid out again at the final size, so glyphs keep
             their spacing (a scaled 390px layout smears letters together) */
          zoom: fit.scale,
        }}
      >
        {children}
      </div>
    </div>
  )
}
