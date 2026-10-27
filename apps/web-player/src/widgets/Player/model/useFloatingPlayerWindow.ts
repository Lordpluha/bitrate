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
          height: 200,
          width: 320,
        })
      : window.open('', 'bitrate-floating-player', 'popup,width=320,height=200')

    if (!nextWindow) return

    nextWindow.document.title = `${trackTitle} - Bitrate`
    nextWindow.addEventListener('pagehide', () => setTargetWindow(null), {
      once: true,
    })
    setTargetWindow(nextWindow)
  }, [targetWindow, trackTitle])

  return { close, open, targetWindow }
}
