export const SEED_GENRES = [
  { slug: 'electronic', name: 'Electronic', color: '#148a78' },
  { slug: 'dance', name: 'Dance', color: '#e13300' },
  { slug: 'house', name: 'House', color: '#8d67ab' },
  { slug: 'drum-and-bass', name: 'Drum & Bass', color: '#1e3264' },
  { slug: 'dubstep', name: 'Dubstep', color: '#ba5d07' },
  { slug: 'pop', name: 'Pop', color: '#477d95' },
  { slug: 'hip-hop', name: 'Hip-Hop', color: '#bc5900' },
  { slug: 'rock', name: 'Rock', color: '#e61e32' },
  { slug: 'ambient', name: 'Ambient', color: '#0d73ec' },
  { slug: 'workout', name: 'Workout', color: '#777777' },
] as const

export const SEED_SEARCH_QUERIES = [
  'workout mix',
  'new releases',
  'electronic',
  'focus music',
  'night drive',
] as const

export const SEED_PASSWORD = process.env.SEED_USER_PASSWORD ?? 'password123'
