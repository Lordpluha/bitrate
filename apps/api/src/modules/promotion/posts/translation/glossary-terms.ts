const URL = /\bhttps?:\/\/\S+|\bwww\.\S+/giu

/**
 * The terms a translation must keep exactly: names (release, tracks, artist, Bitrate) that
 * appear in the source, and every link and hashtag in it (spec AC-7).
 */
export function glossaryTerms(source: string, names: readonly string[]): string[] {
  const lower = source.toLowerCase()
  const present = [...names, 'Bitrate'].filter(
    (name) => name.trim() !== '' && lower.includes(name.toLowerCase()),
  )
  const links = source.match(URL) ?? []
  const hashtags = source.match(/#[\p{L}\p{N}_]+/gu) ?? []
  return [...new Set([...present, ...links, ...hashtags])]
}
