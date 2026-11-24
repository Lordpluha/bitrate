import type { enCommon } from '../en/common'

export const plCommon: Record<keyof typeof enCommon, string> = {
  'common.tryAgain': 'Spróbuj ponownie',
  'common.connected': 'Połączono z Bitrate',
  'common.loading': 'Ładowanie…',
  'common.back': 'Wstecz',
  'common.close': 'Zamknij',
  'common.error.title': 'Coś poszło nie tak',
  'common.error.network': 'Nie można połączyć się z Bitrate. Sprawdź połączenie i spróbuj ponownie.',
  'common.error.rateLimited': 'Zbyt wiele żądań. Odczekaj chwilę i spróbuj ponownie.',
  'common.notFound.title': 'Ten ekran nie istnieje',
  'common.notFound.description': 'Link może być uszkodzony albo treść została usunięta.',
  'common.goHome': 'Przejdź do strony głównej',
  'nav.home': 'Strona główna',
  'nav.search': 'Szukaj',
  'nav.library': 'Biblioteka',
  'nav.profile': 'Profil',
}
