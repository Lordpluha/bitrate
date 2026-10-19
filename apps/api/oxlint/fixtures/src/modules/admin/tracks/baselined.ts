declare const prisma: Record<string, Record<string, (args: object) => unknown>>

export const allowed = () => prisma.track.update({})
