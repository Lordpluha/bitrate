import type { enPlayer } from '../en/player'

export const plPlayer: Record<keyof typeof enPlayer, string> = {
  'player.play': 'Odtwórz',
  'player.pause': 'Pauza',
  'player.next': 'Następny utwór',
  'player.previous': 'Poprzedni utwór',
  'player.seek': 'Pozycja odtwarzania',
  'player.nowPlaying': 'Teraz odtwarzane',
  'player.openNowPlaying': 'Otwórz odtwarzacz',
  'player.idle.title': 'Nic nie gra',
  'player.idle.description': 'Wybierz coś na stronie głównej lub w wyszukiwarce, aby zacząć słuchać.',
  'player.buffering': 'Buforowanie…',
  'player.error.notReady': 'Ten utwór jest jeszcze przetwarzany.',
  'player.error.protected': 'Tego utworu nie można jeszcze odtworzyć w aplikacji mobilnej.',
  'player.error.rateLimited': 'Trochę wolniej — odtwarzanie zaraz wróci.',
  'player.error.failed': 'Nie udało się odtworzyć utworu.',
  'player.unknownArtist': 'Nieznany wykonawca',
}
