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

export const SEED_PODCASTS = [
  {
    title: 'Behind the Beat',
    publisher: 'Spotify Clone Studios',
    description: 'Artists and producers unpack how electronic tracks are made.',
    language: 'en',
  },
  {
    title: 'Night Drive Stories',
    publisher: 'After Hours Audio',
    description: 'Short stories and conversations for late-night listening.',
    language: 'en',
  },
  {
    title: 'Музика без меж',
    publisher: 'Вільний звук',
    description: 'Розмови про сучасну українську та світову музику.',
    language: 'uk',
  },
  {
    title: 'Новые релизы',
    publisher: 'Музыкальный обзор',
    description: 'Еженедельный разбор заметных музыкальных релизов.',
    language: 'ru',
  },
  {
    title: 'Studio Sessions',
    publisher: 'Open Sessions',
    description: 'Practical recording, mixing and songwriting conversations.',
    language: 'en',
  },
  {
    title: 'Focus Frequency',
    publisher: 'Deep Work Radio',
    description: 'Calm conversations about focus, creativity and sustainable work.',
    language: 'en',
  },
] as const

export const SEED_SEARCH_QUERIES = [
  'workout mix',
  'new releases',
  'electronic',
  'focus music',
  'night drive',
  'podcasts',
] as const

export const SEED_PASSWORD = process.env.SEED_USER_PASSWORD ?? 'password123'
