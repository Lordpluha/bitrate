export const delivery = {
  'delivery.availability.notConnected': 'Niepołączone',
  'delivery.availability.unavailable': 'Niedostępne',
  'delivery.availability.notSent': 'Niewysłane',
  'delivery.availability.pending': 'Oczekuje',
  'delivery.availability.live': 'Dostępne',
  'delivery.availability.failed': 'Błąd',
  'delivery.availability.takenDown': 'Usunięte',
  'delivery.noStores': 'Nie zaplanowano sklepów',
  'delivery.worldwide': 'Cały świat',
  'delivery.countries.one': '{count} kraj',
  'delivery.countries.other': '{count} kraju',
  'delivery.error.load':
    'Nie udało się wczytać planu dostawy. Spróbuj ponownie.',
  'delivery.error.loadList':
    'Nie udało się wczytać dystrybucji. Spróbuj ponownie.',
  'delivery.error.stale':
    'Wydanie się zmieniło lub nie jest już szkicem. Twoje wybory zostały tutaj; zamknij i ponownie otwórz formularz, aby zobaczyć najnowszą wersję.',
  'delivery.error.unconfirmed':
    'Nie udało się potwierdzić zapisania planu dostawy. Zamknij formularz i sprawdź wydanie przed ponowną próbą.',
  'delivery.error.invalid':
    'Wybierz sklepy i poprawne kraje, a następnie spróbuj ponownie.',
  'delivery.lock.planLive':
    'Wydanie jest już opublikowane; jego planu dostawy nie można zmienić.',
  'delivery.lock.planPublishing':
    'Plan dostawy jest zablokowany podczas publikowania wydania.',
  'delivery.lock.planRejected':
    'Aby zmienić plan dostawy, wybierz „Rozpocznij poprawki” na etapie weryfikacji.',
  'delivery.lock.planReview':
    'Plan dostawy jest zablokowany, dopóki Bitrate weryfikuje wydanie.',
  'delivery.lock.scheduleLive':
    'Wydanie jest już opublikowane; jego terminu nie można zmienić.',
  'delivery.lock.schedulePublishing':
    'Termin wydania jest zablokowany podczas publikowania.',
  'delivery.lock.scheduleRejected':
    'Aby zmienić termin wydania, wybierz „Rozpocznij poprawki” na etapie weryfikacji.',
  'delivery.lock.scheduleReview':
    'Termin wydania jest zablokowany, dopóki Bitrate weryfikuje wydanie.',
  'delivery.title': 'Plan dostawy',
  'delivery.loading': 'Wczytywanie planu dostawy…',
  'delivery.check.approved': 'Weryfikacja Bitrate zatwierdzona',
  'delivery.check.premiere': 'Premiera {date} UTC',
  'delivery.check.rightAway': 'Pojawi się od razu po publikacji',
  'delivery.check.noStores': 'Nie zaplanowano jeszcze sklepów',
  'delivery.editSchedule': 'Zmień termin',
  'delivery.timingIntro':
    'Kiedy i gdzie ukaże się wydanie. Pozostaje planem, dopóki partner dystrybucyjny go nie dostarczy.',
  'delivery.dateUtc': '{date} UTC',
  'delivery.premiereHint':
    'Premiera: wydanie pojawi się w tym dniu i o tej godzinie.',
  'delivery.territories': 'Terytoria',
  'delivery.territoriesHint':
    'Kraje, w których słuchacze je znajdą. Zmienisz je w planie dostawy.',
  'delivery.destinations': 'Miejsca docelowe',
  'delivery.plannedCount': 'Zaplanowano {planned} z {total}',
  'delivery.stores': 'Sklepy',
  'delivery.inPlan': 'W planie',
  'delivery.notInPlan': 'Poza planem',
  'delivery.beforeContinue': 'Zanim przejdziesz dalej',
  'delivery.next.sent':
    'Stany sklepów poniżej raportuje partner dystrybucyjny.',
  'delivery.next.choose': 'Wybierz sklepy i terytoria dla tego wydania.',
  'delivery.next.partner':
    'Dostawa rozpocznie się po podłączeniu partnera dystrybucyjnego.',
  'delivery.editPlan': 'Edytuj plan dostawy',
  'delivery.honest.sent': 'Dostawa rozpoczęła się przez podłączonego partnera.',
  'delivery.honest.notSent':
    'Nic nie zostało wysłane. Zapisanie planu nie wysyła wydania na żadną zewnętrzną platformę.',
  'delivery.noStoresShort': 'Nie zaplanowano sklepów.',
  'delivery.notInPlanSr': '(poza planem)',
  'delivery.chooseCountry':
    'Wybierz co najmniej jeden kraj lub dostawę na cały świat.',
  'delivery.savePlan': 'Zapisz plan',
  'delivery.planIntro':
    'Zaplanuj, dokąd ma trafić wydanie. Zapisanie planu niczego nie wysyła: dostawa rozpocznie się dopiero po podłączeniu partnera dystrybucyjnego.',
  'delivery.selectedCountries': 'Wybrane kraje',
  'delivery.searchCountries': 'Szukaj krajów',
  'delivery.noCountries': 'Nie wybrano krajów',
  'delivery.selected': 'Wybrano {count}: {names}',
  'delivery.noMatch': 'Żaden kraj nie pasuje do „{query}”.',
  'delivery.page.subtitle':
    'Dokąd planowane są Twoje wydania i co raportują sklepy.',
  'delivery.page.noPartner':
    'Nie podłączono jeszcze partnera dystrybucyjnego, więc nic nie zostało wysłane do serwisów streamingowych. Już teraz możesz planować sklepy i terytoria; dostawa ruszy po podłączeniu partnera.',
  'delivery.page.loading': 'Wczytywanie dystrybucji…',
  'delivery.page.empty':
    'Brak wydań. Utwórz wydanie, aby zaplanować jego dostawę.',
  'delivery.page.openMusic': 'Otwórz Muzykę',
  'delivery.page.sent': 'Wysłano do partnera',
  'delivery.page.pages': 'Strony dystrybucji',
  'delivery.countries.few': '{count} kraje',
  'delivery.countries.many': '{count} krajów',
} as const
