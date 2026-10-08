/** Server-side override supports the internal API address without exposing it to the browser. */
export function getArtistApiUrl(): string {
  return (
    process.env.API_URL ||
    import.meta.env.VITE_API_URL ||
    'http://localhost:3000'
  )
}
