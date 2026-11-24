/** The ways a release date may appear in copy, so the grounding check accepts each of them. */
export function dateFacts(date: Date): string[] {
  const opts = { timeZone: 'UTC' } as const
  return [
    date.toISOString().slice(0, 10),
    date.toLocaleDateString('en-US', { ...opts, month: 'short', day: 'numeric', year: 'numeric' }),
    date.toLocaleDateString('en-US', { ...opts, month: 'long', day: 'numeric' }),
    date.toLocaleDateString('en-GB', { ...opts, day: 'numeric', month: 'long', year: 'numeric' }),
  ]
}
