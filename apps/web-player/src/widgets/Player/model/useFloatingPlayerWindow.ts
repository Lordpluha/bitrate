'use client'

import { useCallback, useState } from 'react'

type DocumentPictureInPictureWindow = Window & {
  documentPictureInPicture?: {
    requestWindow: (options?: {
      height?: number
      width?: number
    }) => Promise<Window>
  }
}

export const useFloatingPlayerWindow = (trackTitle?: string) => {
  const [targetWindow, setTargetWindow] = useState<Window | null>(null)

  const close = useCallback(() => {
    if (targetWindow && !targetWindow.closed) targetWindow.close()
    setTargetWindow(null)
  }, [targetWindow])

  const open = useCallback(async () => {
    if (!trackTitle) return

    if (targetWindow && !targetWindow.closed) {
      targetWindow.focus()
      return
    }

    const currentWindow = window as DocumentPictureInPictureWindow
    const nextWindow = currentWindow.documentPictureInPicture
      ? await currentWindow.documentPictureInPicture.requestWindow({
          height: 140,
          width: 380,
        })
      : window.open('', 'spotify-floating-player', 'popup,width=380,height=140')

    if (!nextWindow) return

    nextWindow.document.title = `${trackTitle} - Spotify`
    nextWindow.addEventListener('pagehide', () => setTargetWindow(null), {
      once: true,
    })
    setTargetWindow(nextWindow)
  }, [targetWindow, trackTitle])

  return { close, open, targetWindow }
}
