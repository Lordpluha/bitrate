declare const prisma: Record<string, Record<string, (args: object) => unknown>>

export const onlyOneLeft = () => prisma.searchHistory.create({})
