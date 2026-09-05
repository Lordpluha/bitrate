import { useLayoutEffect } from 'react'

const stylesheetSelector = 'style, link[rel="stylesheet"]'

export const useFloatingPlayerStyles = (targetWindow: Window | null) => {
  useLayoutEffect(() => {
    if (!targetWindow || targetWindow.closed) return

    targetWindow.document.documentElement.className =
      document.documentElement.className
    const styles = Array.from(
      document.head.querySelectorAll<HTMLStyleElement | HTMLLinkElement>(
        stylesheetSelector,
      ),
      (node) => node.cloneNode(true) as HTMLStyleElement | HTMLLinkElement,
    )

    targetWindow.document.head.append(...styles)

    return () => {
      styles.forEach((style) => {
        style.remove()
      })
    }
  }, [targetWindow])
}
