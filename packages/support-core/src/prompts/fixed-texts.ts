import type { Locale } from '../domain.js'

interface FixedTexts {
  handoff: string
  fallback: string
  /** A messenger's first message (Telegram `/start`). */
  welcome: string
  /** Sent once when a messenger contact writes faster than the rate limit allows. */
  limited: string
}

/** Texts the agent sends itself, without the model, so they are always correct. */
export const FIXED_TEXTS: Record<Locale, FixedTexts> = {
  en: {
    handoff:
      'I have passed your conversation to the Bitrate team. An operator will reply here as soon as possible.',
    fallback:
      'Sorry, I could not find an answer to that. Would you like me to connect you with a person from the Bitrate team?',
    welcome:
      'Hi! I am the Bitrate support assistant. Ask about the player, plans or releasing your music, or ask for a person from the Bitrate team.',
    limited: 'You are sending messages too fast. Wait a minute and try again.',
  },
  uk: {
    handoff: 'Я передав вашу розмову команді Bitrate. Оператор відповість тут, щойно зможе.',
    fallback:
      'Вибачте, я не знайшов відповіді на це питання. Бажаєте, щоб я з’єднав вас із людиною з команди Bitrate?',
    welcome:
      'Привіт! Я асистент підтримки Bitrate. Питайте про плеєр, тарифи чи випуск музики або попросіть з’єднати з людиною з команди Bitrate.',
    limited: 'Ви надсилаєте повідомлення надто часто. Зачекайте хвилину й спробуйте знову.',
  },
  pl: {
    handoff:
      'Przekazałem rozmowę zespołowi Bitrate. Operator odpowie tutaj najszybciej, jak to możliwe.',
    fallback:
      'Przepraszam, nie znalazłem odpowiedzi na to pytanie. Czy połączyć Cię z człowiekiem z zespołu Bitrate?',
    welcome:
      'Cześć! Jestem asystentem wsparcia Bitrate. Zapytaj o odtwarzacz, plany lub wydawanie muzyki albo poproś o kontakt z człowiekiem z zespołu Bitrate.',
    limited: 'Wysyłasz wiadomości zbyt szybko. Odczekaj minutę i spróbuj ponownie.',
  },
}
