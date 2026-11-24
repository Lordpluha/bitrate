import type { enPlayer } from '../en/player'

export const ukPlayer: Record<keyof typeof enPlayer, string> = {
  'player.play': 'Відтворити',
  'player.pause': 'Пауза',
  'player.next': 'Наступний трек',
  'player.previous': 'Попередній трек',
  'player.seek': 'Позиція відтворення',
  'player.nowPlaying': 'Зараз грає',
  'player.openNowPlaying': 'Відкрити плеєр',
  'player.idle.title': 'Нічого не грає',
  'player.idle.description': 'Оберіть щось на головній або в пошуку, щоб почати слухати.',
  'player.buffering': 'Буферизація…',
  'player.error.notReady': 'Цей трек ще обробляється.',
  'player.error.protected': 'Цей трек поки не можна відтворити в мобільному застосунку.',
  'player.error.rateLimited': 'Трохи повільніше — відтворення скоро продовжиться.',
  'player.error.failed': 'Не вдалося відтворити трек.',
  'player.unknownArtist': 'Невідомий виконавець',
}
