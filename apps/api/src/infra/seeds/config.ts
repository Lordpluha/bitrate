/**
 * Конфигурация для NCS Seed скрипта
 *
 * Отредактируйте этот файл для изменения параметров импорта
 */

export const config = {
  /**
   * Количество страниц NCS для импорта
   * Каждая страница содержит ~30-50 треков
   */
  pagesToImport: 1,

  /**
   * Задержка между запросами к NCS API (в миллисекундах)
   * Увеличьте если получаете rate limiting ошибки
   */
  delayBetweenPages: 2000,

  /**
   * Фильтры для импорта треков
   * Оставьте пустым {} для импорта всех треков
   *
   * Примеры:
   * - { genre: 'drumstep' }
   * - { mood: 'dark' }
   * - { search: 'uplifting' }
   * - { version: 'regular' | 'instrumental' | 'both' }
   */
  filters: {},

  /**
   * Очистить существующие данные перед импортом
   */
  clearBeforeImport: true,

  /**
   * Пути к директориям хранения (относительно apps/api)
   */
  storagePaths: {
    tracks: 'storage/private/tracks',
    covers: 'storage/public/tracks/covers',
  },

  /**
   * Таймауты для скачивания файлов (в миллисекундах)
   */
  downloadTimeout: 60000,

  /**
   * Формат файлов
   */
  fileFormat: {
    audio: 'mp3',
    cover: 'jpg',
    bitrate: 320,
    codec: 'mp3',
  },
}

export default config
