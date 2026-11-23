import type { Locale } from '../domain.js'

interface FixedTexts {
  handoff: string
  fallback: string
}

/** Texts the agent sends itself, without the model, so they are always correct. */
export const FIXED_TEXTS: Record<Locale, FixedTexts> = {
  en: {
    handoff:
      'I have passed your conversation to the Bitrate team. An operator will reply here as soon as possible.',
    fallback:
      'Sorry, I could not find an answer to that. Would you like me to connect you with a person from the Bitrate team?',
  },
  uk: {
    handoff: 'Я передав вашу розмову команді Bitrate. Оператор відповість тут, щойно зможе.',
    fallback:
      'Вибачте, я не знайшов відповіді на це питання. Бажаєте, щоб я з’єднав вас із людиною з команди Bitrate?',
  },
  pl: {
    handoff:
      'Przekazałem rozmowę zespołowi Bitrate. Operator odpowie tutaj najszybciej, jak to możliwe.',
    fallback:
      'Przepraszam, nie znalazłem odpowiedzi na to pytanie. Czy połączyć Cię z człowiekiem z zespołu Bitrate?',
  },
}
