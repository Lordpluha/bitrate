export const delivery = {
  'delivery.availability.notConnected': 'Не під’єднано',
  'delivery.availability.unavailable': 'Недоступно',
  'delivery.availability.notSent': 'Не надіслано',
  'delivery.availability.pending': 'Очікує',
  'delivery.availability.live': 'Доступно',
  'delivery.availability.failed': 'Помилка',
  'delivery.availability.takenDown': 'Знято',
  'delivery.noStores': 'Магазини не заплановано',
  'delivery.worldwide': 'По всьому світу',
  'delivery.countries.one': '{count} країна',
  'delivery.countries.other': '{count} країни',
  'delivery.error.load':
    'Не вдалося завантажити план доставки. Спробуйте ще раз.',
  'delivery.error.loadList':
    'Не вдалося завантажити дистрибуцію. Спробуйте ще раз.',
  'delivery.error.stale':
    'Реліз змінився або більше не є чернеткою. Ваш вибір збережено тут; закрийте й знову відкрийте форму, щоб побачити актуальну версію.',
  'delivery.error.unconfirmed':
    'Не вдалося підтвердити збереження плану доставки. Закрийте форму й перевірте реліз, перш ніж пробувати знову.',
  'delivery.error.invalid':
    'Оберіть магазини й коректні країни, а тоді спробуйте ще раз.',
  'delivery.lock.planLive':
    'Реліз уже вийшов — його план доставки більше не можна змінити.',
  'delivery.lock.planPublishing':
    'План доставки заблоковано, поки реліз публікується.',
  'delivery.lock.planRejected':
    'Щоб змінити план доставки, оберіть «Почати доопрацювання» на етапі перевірки.',
  'delivery.lock.planReview':
    'План доставки заблоковано, поки Bitrate перевіряє реліз.',
  'delivery.lock.scheduleLive':
    'Реліз уже вийшов — його дату більше не можна змінити.',
  'delivery.lock.schedulePublishing':
    'Дату релізу заблоковано, поки реліз публікується.',
  'delivery.lock.scheduleRejected':
    'Щоб змінити дату релізу, оберіть «Почати доопрацювання» на етапі перевірки.',
  'delivery.lock.scheduleReview':
    'Дату релізу заблоковано, поки Bitrate перевіряє реліз.',
  'delivery.title': 'План доставки',
  'delivery.loading': 'Завантажуємо план доставки…',
  'delivery.check.approved': 'Перевірку Bitrate схвалено',
  'delivery.check.premiere': 'Прем’єра {date} UTC',
  'delivery.check.rightAway': 'Вийде одразу після публікації',
  'delivery.check.noStores': 'Магазини ще не заплановано',
  'delivery.editSchedule': 'Змінити дату',
  'delivery.timingIntro':
    'Коли й де вийде реліз. Це лише план, доки його не доставить партнер із дистрибуції.',
  'delivery.dateUtc': '{date} UTC',
  'delivery.premiereHint': 'Прем’єра: реліз вийде в цю дату й час.',
  'delivery.territories': 'Території',
  'delivery.territoriesHint':
    'Країни, де слухачі зможуть його знайти. Змінюються в плані доставки.',
  'delivery.destinations': 'Майданчики',
  'delivery.plannedCount': 'Заплановано {planned} з {total}',
  'delivery.stores': 'Магазини',
  'delivery.inPlan': 'У плані',
  'delivery.notInPlan': 'Не в плані',
  'delivery.beforeContinue': 'Перш ніж продовжити',
  'delivery.next.sent':
    'Стани магазинів нижче повідомляє партнер із дистрибуції.',
  'delivery.next.choose': 'Оберіть магазини й території для цього релізу.',
  'delivery.next.partner':
    'Доставка почнеться, щойно буде під’єднано партнера з дистрибуції.',
  'delivery.editPlan': 'Змінити план доставки',
  'delivery.honest.sent': 'Доставка почалася через під’єднаного партнера.',
  'delivery.honest.notSent':
    'Нічого не надіслано. Збереження плану не надсилає реліз на жодну зовнішню платформу.',
  'delivery.noStoresShort': 'Магазини не заплановано.',
  'delivery.notInPlanSr': '(не в плані)',
  'delivery.chooseCountry':
    'Оберіть щонайменше одну країну або доставку по всьому світу.',
  'delivery.savePlan': 'Зберегти план',
  'delivery.planIntro':
    'Сплануйте, куди має вийти реліз. Збереження плану нічого не надсилає: доставка почнеться лише після під’єднання партнера з дистрибуції.',
  'delivery.selectedCountries': 'Обрані країни',
  'delivery.searchCountries': 'Пошук країн',
  'delivery.noCountries': 'Країни не обрано',
  'delivery.selected': 'Обрано {count}: {names}',
  'delivery.noMatch': 'Немає країни, що відповідає «{query}».',
  'delivery.page.subtitle':
    'Куди заплановано ваші релізи й що повідомляють магазини.',
  'delivery.page.noPartner':
    'Партнера з дистрибуції ще не під’єднано, тож на стримінгові сервіси нічого не надіслано. Магазини й території можна планувати вже зараз; доставка почнеться після під’єднання партнера.',
  'delivery.page.loading': 'Завантажуємо дистрибуцію…',
  'delivery.page.empty':
    'Релізів ще немає. Створіть реліз, щоб спланувати його доставку.',
  'delivery.page.openMusic': 'Відкрити «Музику»',
  'delivery.page.sent': 'Надіслано партнеру',
  'delivery.page.pages': 'Сторінки дистрибуції',
  'delivery.countries.few': '{count} країни',
  'delivery.countries.many': '{count} країн',
} as const
