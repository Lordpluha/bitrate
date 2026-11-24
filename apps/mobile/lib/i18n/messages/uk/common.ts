import type { enCommon } from '../en/common'

export const ukCommon: Record<keyof typeof enCommon, string> = {
  'common.tryAgain': 'Спробувати ще раз',
  'common.connected': 'Підʼєднано до Bitrate',
  'common.loading': 'Завантаження…',
  'common.back': 'Назад',
  'common.close': 'Закрити',
  'common.error.title': 'Щось пішло не так',
  'common.error.network': 'Не вдається підʼєднатися до Bitrate. Перевірте зʼєднання і спробуйте ще раз.',
  'common.error.rateLimited': 'Забагато запитів. Зачекайте трохи й спробуйте ще раз.',
  'common.notFound.title': 'Такого екрана не існує',
  'common.notFound.description': 'Можливо, посилання пошкоджене або вміст видалено.',
  'common.goHome': 'На головну',
  'nav.home': 'Головна',
  'nav.search': 'Пошук',
  'nav.library': 'Медіатека',
  'nav.profile': 'Профіль',
}
