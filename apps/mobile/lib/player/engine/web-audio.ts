let element: HTMLAudioElement | null = null

/** The single audio element the web engine plays through, created on first use. */
export function webAudio(): HTMLAudioElement {
  element ??= new Audio()
  element.preload = 'auto'
  return element
}
