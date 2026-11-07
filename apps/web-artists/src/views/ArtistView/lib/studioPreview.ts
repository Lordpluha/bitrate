export type StudioPreviewTab = 'workspace' | 'dashboard' | 'analytics'

export const WAVEFORM_PEAKS = [
  0.28, 0.52, 0.41, 0.74, 0.62, 0.88, 0.54, 0.36, 0.68, 0.94, 0.82, 0.58, 0.44,
  0.84, 0.96, 0.66, 0.48, 0.72, 0.9, 0.6, 0.42, 0.78, 0.86, 0.56, 0.38, 0.7,
  0.92, 0.64, 0.46, 0.8, 0.58, 0.34, 0.62, 0.76, 0.5, 0.4,
] as const

export const DEMO_DAILY_PLAYS = [
  { date: '2026-10-10', plays: 310 },
  { date: '2026-10-12', plays: 385 },
  { date: '2026-10-14', plays: 420 },
  { date: '2026-10-16', plays: 390 },
  { date: '2026-10-18', plays: 510 },
  { date: '2026-10-20', plays: 640 },
  { date: '2026-10-22', plays: 590 },
  { date: '2026-10-24', plays: 720 },
  { date: '2026-10-26', plays: 685 },
  { date: '2026-10-28', plays: 840 },
  { date: '2026-10-30', plays: 790 },
  { date: '2026-11-01', plays: 920 },
  { date: '2026-11-03', plays: 880 },
  { date: '2026-11-05', plays: 1040 },
] as const

/** A premiere a week out, so the live countdowns always have something to tick towards. */
export const PREMIERE_AT = new Date(
  Date.now() + 7 * 86_400_000 + 5 * 3_600_000,
).toISOString()
