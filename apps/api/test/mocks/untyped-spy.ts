/**
 * A mock as an untyped spy for call assertions that pass a Prisma transaction client. TypeScript
 * would otherwise compare the whole client against the matcher's parameter type and give up with
 * "Excessive stack depth"; the assertion itself is unchanged.
 */
export const untypedSpy = (mock: unknown): unknown => mock
