/** The accessible label for the play/pause control, naming the track when one is known. */
export function playPauseLabel(trackTitle: string, playing: boolean): string {
  const base = trackTitle ? `"${trackTitle}"` : 'track'
  return `${playing ? 'Pause' : 'Play'} ${base}`
}
