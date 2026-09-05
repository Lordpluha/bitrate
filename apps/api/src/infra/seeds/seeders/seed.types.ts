/** The slice of the track upload service the seeder needs, without importing it. */
export interface ITrackUploadService {
  create(
    artistId: string,
    createTrackDto: { title: string },
    audioFile: Express.Multer.File,
    coverFile?: Express.Multer.File,
  ): Promise<{ id: string }>
}

/** The slice of the token service the seeder needs, without importing it. */
export interface IPasswordHasher {
  hashPassword(password: string): Promise<string>
}

/** What one NCS import pass produced. */
export type NcsImportStats = {
  totalTracksImported: number
  totalArtistsImported: number
}
