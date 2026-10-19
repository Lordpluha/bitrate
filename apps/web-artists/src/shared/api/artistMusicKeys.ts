export const artistMusicKeys = {
  artist: (artistId: string | undefined) => ['releases', artistId] as const,
}
