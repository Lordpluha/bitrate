declare const prisma: Record<string, Record<string, (args: object) => unknown>>

export const owned = () => prisma.track.update({})
export const read = () => prisma.album.findMany({})
