# Bitrate for Artists — план дизайна приложения

Обновлено: 13 сентября 2026.

Это чек-лист макетов, а не список уже работающих функций. Отметка `[x]`
означает, что пункт подготовлен и технически проверен; финальное визуальное
согласование владельцем отмечается отдельно. Реализация в коде не подразумевается.
Подготовлены полная карта artist-продукта и самостоятельная White-система
на Component Masters 00/00B, Extended Color 02B и системных экранах 01–08.
Runtime-проверки доступности и промежуточных ширин
остаются в плане.

## 1. Задача и границы

Помочь независимому музыканту пройти путь от готового трека до публикации,
продвижения и понимания результата. В каждом разделе должно быть понятно:
что происходит, что нужно сделать дальше и что мешает продолжить.

- White-вариант приложения делаем в
  `pencil/web-artist-disign-white/web-artist-white.pen`.
- Все видимые надписи artist-интерфейса пока на английском. Логику и вопросы
  для обсуждения пишем по-русски в отдельных фреймах над макетами, вне UI.
  Это редактируемые заметки, не встроенные комментарии Pencil и не локализация приложения.
- Основа — скопированная дизайн-система из `pencil/web-player-disign/web-player.pen`:
  палитра, компоненты, типографика, сетка, состояния и оригинальные логотипы.
- Источники продуктовых ограничений: `PRODUCT.md` и `apps/docs/docs/brand/brand.md`.
- Это рабочий кабинет, не лендинг: читаемость таблиц, форм и действий важнее
  декоративных эффектов. Не переносим в приложение неоновые сцены из hero.
- Авторизация уже имеет отдельную artist-поверхность. Наличие API не означает,
  что кабинет, аналитика или дистрибуция уже реализованы.
- Данные макетов — демонстрационные. Не обещаем реальные интеграции, доход,
  охваты или успешную публикацию без подтверждённой реализации.

## 2. Общая оболочка и дизайн-система

- [x] Проверить перенос всей системы: Component Masters, Foundations, Color,
  Extended Color, Type & Layout, Controls & Feedback, Music Content, Player System,
  Patterns & States, Iconography & Governance и Landing Component Masters.
- [x] Проверить переменные, связи экземпляров с компонентами и доступность изображений.
  Проверены 95 переменных, 44 reusable-компонента и 215 экземпляров; разорванных
  component refs и неизвестных переменных нет. Все восемь локальных assets существуют,
  девять внешних Unsplash URL 9 сентября 2026 отвечают HTTP 200. Ошибочная локальная
  ссылка `album-aftergl.webp` в search preview исправлена на `album-afterglow.webp`.
- [x] Сохранить три темы: Dark, Light, Dim. Этот файл — отдельная White-разведка;
  Dark и основной нейтральный Dim не перезаписывать.
- [x] Общая навигация: Дашборд, Музыка, Продвижение, Аналитика, Профиль, Настройки.
- [x] Общие элементы: логотип, активный раздел, поиск по кабинету, уведомления,
  меню аккаунта и заметное действие «Создать релиз».
- [x] Определить поведение навигации на узком экране: сворачиваемая панель,
  доступные подписи, без потери основных действий.
- [x] Подготовить единые таблицы, фильтры, вкладки, меню действий, модальные окна,
  поля загрузки, подсказки, статусы и подтверждения.
- [x] Разделить активный выбор, информационное сообщение, успех, предупреждение
  и ошибку; не передавать смысл только цветом.

## 3. Дашборд

Главный вопрос: «Как идут мои релизы и что мне сделать сейчас?»

- [x] Первый вход без музыки: короткое объяснение и действие Create your first release.
- [x] Возвращение в кабинет: текущий релиз, его этап и ближайшая задача.
- [x] Блок «Требует внимания»: исправления, незаполненные данные, дедлайны.
- [x] Краткая сводка по каталогу и доступным показателям с выбранным периодом.
  Заполненные Bitrate-owned метрики, сравнение, источник, часовой пояс и freshness
  подготовлены без неподтверждённых внешних площадок или дохода.
- [x] Ближайшие даты и последние события: загрузка и завершение проверки аудио.
- [x] Быстрый переход к релизу, аналитике и продвижению без дублирования меню.
  В макете показаны точки входа; целевые разделы и переходы ещё не реализованы.
- [x] Состояния: новый артист, активная работа, всё завершено, данные ещё собираются.
  Сравнение ключевых состояний собрано на одном компактном фрейме; loading и
  recoverable error добавлены рядом, чтобы проверять структуру без полноэкранных дублей.

## 4. Музыка — список треков и релизов

- [x] Переключение между Tracks и Releases: заполненные desktop/mobile
  представления для треков и групп Single, EP, Album.
- [x] Таблица Tracks: обложка, название, версия/длительность, статус, дата,
  связанный релиз и контекстное действие.
- [x] Поиск, сортировка, фильтры по статусу и типу; Reset, открытый фильтр,
  применённые значения и пустой результат с Clear filters.
- [x] Прослушивание своего трека с понятным текущим состоянием воспроизведения.
  Активная строка Night Signal показывает Pause; остальные строки показывают Play.
- [x] Просмотр и редактирование метаданных, открытие рабочего пространства релиза.
- [x] Черновики, загрузка, обработка, ошибка обработки, проверка и опубликованные
  материалы визуально различимы; окончательную модель статусов сверить с реализацией.
- [x] Архивация/удаление только с ясными последствиями и подтверждением;
  действия с опубликованным релизом отделить от удаления черновика.

### Загрузка и создание релиза

- [x] Пошаговый путь: Audio → Artwork → Details → Contributors/Rights → Review
  подготовлен в desktop/mobile; каждый шаг сохраняет draft summary и понятный Continue.
- [x] Audio: выбор Single / EP / Album, добавление первого файла, сохранение
  черновика и понятная причина недоступности перехода дальше.
- [x] Прогресс загрузки и обработки, отмена, повтор после восстановимой ошибки,
  сохранение черновика и успешное завершение собраны в компактном сравнении состояний.
- [x] Artwork: пустое состояние загрузки, проверка готового аудио, рекомендации
  перед добавлением обложки и заблокированный Continue до успешной валидации.
- [ ] Техническая валидация аудио и обложки: сценарий исправления предусмотрен, но форматы,
  размеры и лимиты нужно взять из подтверждённых delivery-требований, не придумывать.
- [x] Details: название релиза и трека, optional-версия, explicit-ответ,
  основной и дополнительный жанр; обязательность, сохранение и ошибки полей явны.
- [x] Порядок треков для EP/альбома показать отдельным multi-track состоянием.
- [x] Contributors/Rights: участники, обязательная роль, владелец master,
  полнота списка авторов, подтверждение точности и блокирующие проверки.
- [x] Review: финальная сводка готовности, точные Edit-переходы, blockers,
  подтверждение, submitting/error/success и честный Submit for review.

Текущие макеты: `y4r5Lx` / `mP3EG` — Audio desktop/mobile; `fuFvh` — состояния
загрузки; `aISEQ` / `iW0o7` — Artwork desktop/mobile. Русские продуктовые заметки:
`Tndbs`, `mHJou`, `VlV64`. `nygmf` / `g9VtYR` — Details desktop/mobile;
`YkHj6` — состояния формы Details; русская заметка — `XO7r1`.
`ojDoL` / `V5qAC` — Contributors/Rights desktop/mobile; `JYEaf` — состояния
ролей, прав и progression gate; русская заметка — `ECkYY`.
`gK5Ae` / `FgB5s` — Final Review desktop/mobile; `Z8Pcr` — blocked,
submitting, failed и submitted states; русская заметка — `Wrh3P`.
Все надписи внутри приложения остаются на английском.

Завершающие макеты Music: `RlAV8` / `g0Lz3` — metadata editor с Required,
Optional и Read only полями, draft-safe сохранением и отдельным Open workspace;
`M0sfEp` / `Lwatu` — порядок пяти треков EP, доступная альтернатива drag-and-drop,
per-track readiness и draft-only Save order; `Ehnte` / `Y2k3a` — Draft,
Uploading, Processing, Processing error, In review, Published и отдельные
Archive/Delete последствия. Русские заметки: `fqS7r`, `AWxvJ`, `P7ucde`.
Финальные PNG: `output/artist-music-completion-v1/final/`. Delivery-specific
форматы, размеры и идентификаторы по-прежнему не выдуманы.

## 5. Рабочее пространство релиза

Связующий экран для треков, задач, версий и этапов публикации. Детали процесса
пока проектируем как концепт: не выдаём дистрибуцию за работающую интеграцию.

- [x] Шапка: обложка, название, тип релиза, Review in progress и основное
  следующее действие Open feedback.
- [x] Таймлайн: Draft → Review → Prepare → Deliver → Launch; текущий этап
  отделён от завершённого и ещё не начатого.
- [x] Readiness текущего релиза: Audio, Artwork и Rights с явными Ready/In review;
  материалы продвижения остаются отдельным будущим расширением.
- [x] Задачи с дедлайнами, ответственными и блокирующими замечаниями:
  заполненные desktop/mobile представления, фильтры, сортировка и следующий blocker.
- [x] Версии аудио: выбранный current master, предыдущая версия, playback
  и точка добавления новой версии; полноценное сравнение волн ещё не проектировалось.
- [x] История проверки и feedback: reviewer question, Changes requested,
  resubmission и Approved отличаются статусом и следующим действием.
- [x] Детальный reviewer feedback: required change и recommendation разделены;
  ответ, отметка resolved, повторная отправка и восстановимая ошибка не теряют данные.
- [x] Планируемая дата, часовой пояс и внешние площадки — с явным состоянием
  подключения, ожидания или недоступности в desktop/mobile.
- [x] Статус подготовки доставки: ready to submit не равен handoff; pending,
  unavailable и отсутствие внешней отправки показаны явно.
- [x] Итог после публикации: подтверждённая область Bitrate, ссылки по площадкам,
  сигналы с источником/временем обновления и последующие задачи.

Текущие макеты workspace: `EvWT5` / `mf4LZ` — Review in progress
desktop/mobile; `F89st` — In progress, Changes requested, Approved и recoverable
load error; русская продуктовая заметка — `vPfU6`. `dMPfF` / `U2eW4A` —
детальная работа с reviewer feedback в desktop/mobile; `r9U1c` — open, saving,
resolved, ready to resubmit и recoverable resubmit error; русская логическая
заметка — `t4s7A`. Все данные демонстрационные.
`vvFQO` / `IXDcH` — задачи релиза в desktop/mobile: сроки, часовой пояс,
ответственные, статусы и review blockers; русская логическая заметка — `bgr6U`.
`W8wV8` / `tZ48E` — delivery plan; `i8mjf0` / `mqtop` — submission readiness;
`wMMpY` / `MMKvM` — post-release. Русские заметки: `GNPz1`, `r1gdjA`, `seT1N`.

## 6. Продвижение и реклама

Это инструменты продвижения музыки артиста, а не рекламные баннеры в кабинете.

- [x] Обзор кампаний по релизам: черновик, запланирована, активна, приостановлена, завершена.
- [x] Создание кампании: релиз, цель, аудитория, канал, срок и материалы.
- [x] Редактор публикации: текст, изображение, предпросмотр и календарь.
- [x] AI-помощь с текстами и маркетинговым планом: предложение → редактирование →
  подтверждение артистом. Не публиковать сгенерированный результат автоматически.
- [x] Для платного сценария отдельно показать бюджет, лимит расходов и подтверждение
  запуска; не добавлять выдуманные тарифы и не обещать результат.
- [x] Статусы подключения каналов, проверки материала, отклонения и повторной отправки.
- [x] Отчёт по кампании с определениями доступных показателей и источниками данных.
- [x] Отделить концепт внешних рекламных интеграций от подтверждённых возможностей.

Текущие макеты Promotion: `nEVZv` / `eY3tU` — lifecycle overview;
`DKSYY` / `Z0TTDf` — campaign foundation с release, goal, audience, channels,
timing и отдельной границей paid setup; `HZ3XZ` / `QGs6i` — AI-assisted
editable draft, version-preserving regeneration и обязательный human review.
Русские логические заметки: `P3L9Zj`, `ULmii`, `Gjg7I`.
`w3Y3FF` / `k5rtxH` — publication materials, artwork preview и schedule;
`dubJG` / `Gg2gt` — capped paid setup с blockers и отдельным consent;
`pSqbU` / `icBrr` — Bitrate-owned report, definitions и channel recovery.
Русские логические заметки: `h2cPC`, `VAsdc`, `aYFmu`.

## 7. Аналитика

- [x] Обзор артиста и детализация по релизу/треку.
- [x] Выбор периода, сравнение периодов и подпись часового пояса.
- [x] Прослушивания, слушатели, сохранения и подписки — только после согласования
  определений и источников каждой метрики.
- [x] Динамика, география и источники аудитории, если такие данные доступны.
- [x] Разделить показатели Bitrate и внешних площадок; показывать время обновления.
- [x] Различать ноль, отсутствие данных, задержку обновления и ошибку загрузки.
- [x] Доступные графики: подписи, легенда, значения, табличная альтернатива;
  цвет не должен быть единственным способом сравнения.
- [x] Доход и прогноз — отдельный будущий сценарий: различать факт и оценку,
  показывать ограничения прогноза, не изображать прогноз гарантией.

Текущие макеты Analytics: `ekMe2` / `ScfJe` — artist overview с периодом,
сравнением, часовым поясом, Bitrate-source, временем обновления, доступным
графиком, географией и discovery sources; `gCinE` / `v2W7F6` — release/track
drill-down для Afterglow; `H3pb4S` / `NrbGO` — controls, metric definitions,
observed zero, no data, delayed update, recoverable error и честно недоступные
revenue/forecast. Русские логические заметки: `yapmJ`, `Ik21q`, `G77Pu`.
Финальные PNG: `output/artist-analytics-v1/final/`. Все числа — demo data;
внешние сервисы не объявлены подключёнными.

## 8. Профиль артиста

- [x] Редактирование имени, аватара, обложки, описания и внешних ссылок.
- [x] Предпросмотр публичной страницы и явное разделение публичных/приватных данных.
- [x] Каталог релизов, выделенный релиз и управление порядком доступных блоков.
- [x] Сохранение, отмена, несохранённые изменения и ошибки полей.
- [x] Верификация — отдельный концепт со статусами заявки, без автоматической галочки.
- [x] Не смешивать личный аккаунт, публичный профиль артиста и профиль слушателя.

Текущие макеты Profile: `E8FXx` / `bo6y5` — public details; `umRNn` / `m2TMzU` —
featured release и layout; `NWNpZ` / `fkSss` — save recovery и verification concept.
Русские логические заметки: `G8jYuj`, `EjRR9`, `SpdCr`.

## 9. Настройки

- [x] Аккаунт: почта, пароль и доступные способы входа.
- [x] Безопасность: двухфакторная защита, восстановление доступа и управление сессиями
  в пределах поддерживаемых сценариев.
- [x] Уведомления: релизы, задачи, отчёты, публикации; отдельные категории предпочтений.
- [x] Внешний вид: Dark / Light / Dim, плотность интерфейса при её согласовании.
- [x] Язык интерфейса не выдавать за работающую локализацию: сейчас runtime не подключён.
- [x] Подключённые сервисы: доступы, состояние подключения, отзыв доступа и последствия.
- [x] Команда и роли — будущий сценарий: артист, менеджер, участник; ограничения действий.
- [x] Опасные действия: выход, удаление аккаунта и отключение сервисов — с отдельным
  подтверждением и понятным объяснением того, что будет потеряно.

Текущие макеты Settings: `h6L41N` / `uKCn1` — Account; `bxxmR` / `E5mFT5` —
Security; `nPhsF` / `grIwc` — Notifications, все в desktop/mobile. Русские
логические заметки: `CPw5I`, `rowNa`, `VkyyK`. Способы входа, 2FA, сессии и
каналы уведомлений показаны как статические demo-концепты и не объявлены
подключёнными backend-функциями.
`l0AdPz` / `U686R` — Appearance с выбранной Dim-темой и честно недоступный language runtime;
`finkk` / `oP5z6` — Connected services и permission review;
`Urz87` / `a4Qsh` — Team & safety с отдельным входом в destructive flows.
Русские логические заметки: `Earhq`, `GHCi8`, `uRHY2`.

## 10. Будущие направления — не включать автоматически в первый проход

- [ ] AI-продюсер: оценка готовности релиза и следующий шаг, не генерация музыки.
- [ ] AI-A&R: подходящие музыкальные контексты с объяснением, без обещаний размещения.
- [ ] Автопилот: готовит рутину и напоминает; существенные действия подтверждает артист.
- [ ] Маркетплейс услуг вокруг релиза.
- [ ] Таймлайн карьеры как история опубликованных работ и прогресса.
- [ ] Общение с аудиторией и ответы артиста на комментарии к музыке.
- [ ] Плагины сообщества с понятными разрешениями и отключением.
- [ ] Единая аналитика внешних площадок и финансовые инструменты при появлении источников.

## 11. Проверка каждого экрана

- [x] Есть заполненное, пустое, loading, error и success-состояния, где они применимы.
- [x] Ошибка объясняет проблему и следующий шаг; введённые данные не пропадают.
- [x] Длинные названия, много треков, отсутствующая обложка и недоступные действия учтены.
- [x] Основное действие выделено; hover, focus, pressed и disabled зафиксированы
  как статические reference-состояния для реализации.
- [ ] Читаемость и контраст проверены в трёх темах; цвет дополнен текстом/иконкой.
  Визуальная матрица Dark / Light / Dim подготовлена, но contrast ratios ещё нужно
  измерить в работающем интерфейсе.
- [ ] Есть клавиатурная навигация, подписи контролов и доступный порядок фокуса.
- [ ] Проверены desktop, tablet и узкий экран: таблицы и формы не теряют действия.
- [x] Исходники остаются редактируемыми; используются экземпляры компонентов и токены.
- [x] Демонстрационные данные и будущие возможности подписаны честно.

## 12. Порядок следующих итераций

1. Согласовать этот документ и основную тему. Проверить скопированную дизайн-систему.
2. Сделать оболочку + один качественный дашборд, затем остановиться на проверку.
3. Музыка: список → загрузка → рабочее пространство релиза.
4. Профиль и настройки.
5. Аналитика и продвижение после уточнения доступных данных и интеграций.
6. Будущие направления брать по одному после отдельного согласования.

## 13. Прогресс и точка продолжения

Продуктовые экраны скопированы в `web-artist-white.pen`; отдельный light-pass
сейчас завершён для 00/00B/02B и системных фреймов 01–08. Ниже сохранена карта продуктовых
экранов, которые будут переводиться на White следующими проходами:

White product pass 01 завершён: `pNeG9` — application shell desktop,
`R5LDZj` / `aA6Id` — mobile closed/open, `H3Itmt` — shared patterns,
`QurL2` / `bu2rk` — returning dashboard desktop/mobile. Текущий релиз,
attention, catalog, upcoming, activity и listening data используют разные
светлые семантические поверхности. После snapshot-review убраны тяжёлая тень
sidebar, фиолетовая заливка current release и затемняющее изображение в attention;
мобильная версия повторно проверена отдельным 2× экспортом.

White product pass 02 завершён: `tWPhZ` — dashboard state matrix;
`DhsgM` / `JZHt8` — Tracks desktop/mobile; `dg76H` / `oWM3u` — Releases
desktop/mobile; `mDs8D` — filter and empty states. Desktop сохраняет едва
заметную музыкальную фактуру внутри таблиц, mobile использует чистые карточки
без фоновых изображений. Все шесть фреймов прошли snapshot- и layout-проверку.

- `pNeG9` — `10 • Artist / Application Shell / Desktop`, 1440 × 900.
- `R5LDZj` — `10B • Artist / Shell / Mobile Closed`, 390 × 844.
- `aA6Id` — `10C • Artist / Shell / Mobile Menu Open`, 390 × 844.
- `H3Itmt` — `11 • Artist / Shared Interface Patterns`: таблица, вкладки,
  фильтры, загрузка с примером ошибки, меню аккаунта, подтверждение архивации,
  подсказка к полю и семантические состояния. Блоки оформлены как reusable-компоненты.
- `QurL2` — `12 • Artist / Dashboard / Returning`, 1440 × 1040: Afterglow
  на проверке, следующее действие, два замечания, каталог, ближайшие даты,
  последние события и отсутствие данных аналитики.
- `bu2rk` — `12B • Artist / Dashboard / Returning Mobile`, ширина 390:
  тот же контент в одну колонку с вертикальной прокруткой; каталог — компактные строки.
- `tWPhZ` — `13 • Artist / Dashboard / State Matrix`, 1440 × 950:
  первый вход, all clear, collecting data, loading и load error.
- `rV3Rl` — русская заметка над матрицей с логикой переходов и трактовкой данных.
- `DhsgM` — `14 • Artist / Music / Tracks`, 1440 × 1040: Tracks выбран,
  поиск, статус/тип/сортировка, Upload track, шесть строк и inline playback.
- `JZHt8` — `14B • Artist / Music / Tracks Mobile`, ширина 390:
  те же контролы и шесть треков в компактной вертикальной структуре.
- `S6fzq` — русская заметка над Music с логикой вкладок, фильтров, playback
  и контекстных действий. Статусы пока считаются демонстрационной моделью.
- `dg76H` — `15 • Artist / Music / Releases`, 1440 × 1040: пять релизов,
  Single/EP/Album, статусы, количество треков, release date и updated.
- `oWM3u` — `15B • Artist / Music / Releases Mobile`, ширина 390:
  те же пять релизов и управляющие контролы без потери полей.
- `mDs8D` — `15C • Artist / Music / Filter & Empty States`, 1440 × 710:
  открытый Status filter, applied filters с одним результатом и empty result.
- `W4aLg` — русская заметка с логикой Releases, контекстного меню и фильтров.
- `y4r5Lx` / `mP3EG` — `16 • Create Release / Audio` в desktop/mobile:
  выбор Single/EP/Album, загрузка, сохранение черновика и gated Continue.
- `fuFvh` — `16C • Create Release / Upload States`: ready, drop target,
  uploading, processing, recoverable error и complete с явными действиями.
- `aISEQ` / `iW0o7` — `17 • Create Release / Artwork` в desktop/mobile:
  готовое аудио, загрузка обложки, рекомендации и полная draft summary.
- `nygmf` / `g9VtYR` — `18 • Create Release / Details` в desktop/mobile:
  публичные названия, optional-версия, explicit-ответ, жанры и готовность шага.
- `YkHj6` — `18C • Create Release / Details States`: default, focus,
  required error, complete, сохранение/ошибка сохранения и progression gate.
- `ojDoL` / `V5qAC` — `19 • Create Release / Contributors & Rights`
  в desktop/mobile: участники, роли, подтверждения прав и полная draft summary.
- `JYEaf` — `19C • Contributor & Rights States`: missing role,
  incomplete/confirmed rights, список blockers и готовность к Review.
- `gK5Ae` / `FgB5s` — `20 • Create Release / Final Review`
  в desktop/mobile: release overview, readiness checklist, Edit-переходы и отправка.
- `Z8Pcr` — `20C • Final Review States`: blocked, ready, submitting,
  recoverable failure и submitted for review.
- `EvWT5` / `mf4LZ` — `21 • Release Workspace / Review in Progress`
  в desktop/mobile: статус, next action, feedback, timeline, readiness,
  current master, предыдущая версия и activity.
- `F89st` — `21C • Release Workspace / Review States`: Review in progress,
  Changes requested, Approved и recoverable status error с историей переходов.
- `dMPfF` / `U2eW4A` — `22 • Reviewer Feedback / Changes Requested`
  в desktop/mobile: два обязательных исправления, необязательная рекомендация,
  ответ, resolved-состояние и заблокированная повторная отправка.
- `r9U1c` — `22C • Reviewer Feedback / States`: open, saving, resolved,
  ready to resubmit и recoverable resubmit error.
- `t4s7A` — русская заметка о блокирующей логике required change,
  необязательной recommendation и границе внутренней проверки Bitrate.
- `vvFQO` / `IXDcH` — `23 • Artist / Release Tasks` в desktop/mobile:
  четыре задачи, ближайшие сроки, ответственные, фильтры и два review blockers.
- `bgr6U` — русская заметка о дедлайнах, часовом поясе, назначении
  ответственного и границе плановых задач относительно внешней доставки.
- `W8wV8` / `tZ48E` — `24 • Artist / Delivery Plan` в desktop/mobile:
  дата, время, Europe/Kyiv и Not connected / Pending / Unavailable destinations.
- `i8mjf0` / `mqtop` — `25 • Artist / Delivery Status` в desktop/mobile:
  submission draft, ready package, connection pending, unavailable и явное
  отсутствие внешнего handoff.
- `wMMpY` / `MMKvM` — `26 • Artist / Post-release` в desktop/mobile:
  Bitrate link, состояния внешних ссылок, Bitrate-only demo signals и follow-up tasks.
- `GNPz1`, `r1gdjA`, `seT1N` — русские логические заметки к трём этапам.
- `E8FXx` / `bo6y5` — `27 • Artist / Profile Details` в desktop/mobile:
  public media, display name, handle, bio, links и приватная граница аккаунта.
- `umRNn` / `m2TMzU` — `28 • Artist / Profile Catalog & Layout`:
  featured release, public preview, порядок и видимость доступных блоков.
- `NWNpZ` / `fkSss` — `29 • Artist / Profile Save & Verification`:
  preserved changes, field error, retry/cancel и статусы verification concept.
- `G8jYuj`, `EjRR9`, `SpdCr` — русские логические заметки к Profile flow.
- `h6L41N` / `uKCn1` — `30 • Artist / Settings Account` в desktop/mobile:
  приватная login identity, verified demo email, поддерживаемый password-flow
  и явная граница с публичным профилем артиста.
- `bxxmR` / `E5mFT5` — `31 • Artist / Settings Security` в desktop/mobile:
  password, 2FA, recovery codes, текущая и дополнительная demo-сессия,
  подтверждение завершения сессий и сохранение пути восстановления.
- `nPhsF` / `grIwc` — `32 • Artist / Settings Notifications` в desktop/mobile:
  пять категорий событий, независимые In-app/Email предпочтения, недоступный
  Push и честная оговорка о поведении security-сообщений.
- `CPw5I`, `rowNa`, `VkyyK` — русские логические заметки к трём Settings-экранам.
- `l0AdPz` / `U686R` — `33 • Artist / Settings Appearance` в desktop/mobile:
  Dark / Light / Dim previews, Comfortable / Compact density, system motion
  и недоступный до реализации localization language selector.
- `finkk` / `oP5z6` — `34 • Artist / Settings Connected Services` в desktop/mobile:
  demonstrative connection states, permission boundaries, disconnect review
  и отдельная граница external delivery.
- `Urz87` / `a4Qsh` — `35 • Artist / Settings Team & Safety` в desktop/mobile:
  Owner / Manager / Viewer, pending invite и безопасные review-входы для
  sign-out, deactivation и account deletion.
- `Earhq`, `GHCi8`, `uRHY2` — русские логические заметки к завершающей Settings-тройке.
- `nEVZv` / `eY3tU` — `36 • Artist / Promotion Overview` в desktop/mobile:
  Draft / Scheduled / Active / Paused / Completed, current focus, unavailable
  reporting и отдельная граница paid spend.
- `DKSYY` / `Z0TTDf` — `37 • Artist / Campaign Creation` в desktop/mobile:
  five-step foundation, release, goal, audience direction, owned channels,
  Europe/Kyiv timing, draft readiness и честный progression gate.
- `HZ3XZ` / `QGs6i` — `38 • Artist / AI-assisted Draft` в desktop/mobile:
  source-bound brief, editable copy, preserved variants, review checks,
  explanation и отдельная final approval boundary.
- `P3L9Zj`, `ULmii`, `Gjg7I` — русские логические заметки к Promotion flow.
- `w3Y3FF` / `k5rtxH` — `39 • Artist / Campaign Materials & Calendar`
  в desktop/mobile: artist-edited copy, approved artwork, destination,
  timezone-aware schedule, channel preview и final approval boundary.
- `dubJG` / `Gg2gt` — `40 • Artist / Paid Promotion Setup` в desktop/mobile:
  demo budget и daily cap, no auto-renew, provider/billing blockers,
  unavailable estimate, explicit consent и заблокированный Launch.
- `pSqbU` / `icBrr` — `41 • Artist / Campaign Report & Recovery`
  в desktop/mobile: source-defined Bitrate metrics, period/timezone/update,
  unavailable external signals и preserved-draft retry для failed channel.
- `h2cPC`, `VAsdc`, `aYFmu` — русские логические заметки к завершающей Promotion-тройке.
- `Tndbs`, `mHJou`, `VlV64` — русские заметки о модели Track/Release,
  типах релиза, состояниях загрузки и логике Artwork.
- `XO7r1` — русская заметка о логике обязательных и optional-полей Details.
- `ECkYY` — русская заметка об участниках, ролях и подтверждении прав.
- `Wrh3P` — русская заметка о границе между Bitrate review и external delivery.
- `vPfU6` — русская заметка о логике workspace после отправки на проверку.

Независимая проверка Audio, upload states и Artwork: `ship`. После проверки
Processing получил недоступное действие Checking audio вместо противоречивого
Choose file; в мобильную Artwork summary возвращены Release type и Tracks.
Обрезаний во всех пяти новых экранах нет.

Независимая проверка Details desktop/mobile и form states: `ship`, существенных
замечаний нет. Проверены обязательные/optional-поля, explicit-ответ, жанры,
сохранение с восстановимой ошибкой и доступность Continue. Обрезаний нет.

Независимая проверка Contributors/Rights desktop/mobile и states: `ship`.
После проверки добавлено явное Change owner, отдельное подтверждение полноты
списка авторов и согласованный счётчик blockers. Обрезаний нет.

Независимая проверка Final Review desktop/mobile и submission states: `ship`.
После проверки в верхнюю мобильную readiness summary добавлен Rights — Ready,
поэтому пять областей согласованы с `0 blockers`. Обрезаний нет.

Независимая проверка Release Workspace desktop/mobile и review states: `ship`.
После проверки на mobile возвращён этап Launch и Open feedback превращён
в полноширинное действие без переноса. Обрезаний нет.

Независимая проверка Reviewer Feedback desktop/mobile и states: `ship`.
После проверки на desktop возвращено пояснение recommendation и рядом с resubmit
явно зафиксировано, что действие запускает только повторную проверку Bitrate,
но не публикацию и не внешнюю доставку. Обрезаний нет.

Связка Delivery Plan → Delivery Status → Post-release проверена одним bounded-проходом
в desktop/mobile. После проверки исправлена высота строки Apple Music в desktop
post-release; финальная структурная проверка всех шести экранов не нашла обрезаний.

Связка Profile Details → Catalog & Layout → Save & Verification проверена одним
bounded-проходом в desktop/mobile. После проверки desktop-навигация переключена
с Music на Profile; финальная структурная проверка обрезаний не нашла.

Связка Account → Security → Notifications проверена одним bounded-проходом
в desktop/mobile. Активная desktop-навигация переключена на Settings; отдельно
проверены приватная/публичная граница, подтверждения security-действий и
разделение событий по каналам. Финальные PNG в `output/artist-settings-flow-v1/final/`;
обрезаний и схлопнутых блоков не найдено.

Связка Appearance → Connected services → Team & safety проверена одним
bounded-проходом в desktop/mobile. После проверки выровнены подписи pills/buttons,
убраны пересечения текста и действий в dangerous zone и исправлен нижний отступ
permission review. Финальные PNG в `output/artist-settings-flow-v2/final/`;
обрезаний и схлопнутых блоков не найдено.

Связка Promotion overview → Campaign creation → AI-assisted draft проверена
одним bounded-проходом в desktop/mobile. После проверки увеличена высота
desktop campaign list/current focus, чтобы последняя строка и действия не пересекали
нижнюю границу. Финальные PNG в `output/artist-promotion-v1/final/`; AI copy,
demo connections, paid spend и reporting не выданы за автоматические возможности.

Связка Materials & calendar → Paid setup → Report & recovery проверена одним
bounded-проходом в desktop/mobile. Использована реальная обложка Afterglow из
существующих assets; проверены preview/publish boundary, exact-spend review,
source/definition labels и сохранение draft при channel error. Финальные PNG
в `output/artist-promotion-v2/final/`; обрезаний и схлопнутых блоков не найдено.

Независимая проверка Releases и filter states: `ship`. По результатам проверки
Clear filters переведён в secondary, порядок Recently updated исправлен
(Sep 02 выше Aug 29), мобильная сумма исправлена на 20 tracks. Обрезаний нет.

Независимая проверка Music desktop/mobile: `ship`. После первой проверки на
телефоне возвращены Reset, полное название сортировки и Updated/Release для каждой
строки; Create release в desktop topbar переведён во secondary, поэтому Upload track
остаётся единственным primary-действием выбранной вкладки. Обрезаний не найдено.

Все шесть актуальных artist-макетов переведены на английский, включая подписи
экземпляров кнопок. Исходные мастер-компоненты общей системы не переводились.
Русские заметки вынесены за границы экранов:

- `J4TeuM` — первый вход; `WlJKT` — мобильное меню.
- `B7ijZ` — общие компоненты.
- `ygLQy` — возвращение в кабинет; `UosZM` — порядок блоков на телефоне.

Логика дашборда: сначала текущая работа, затем замечания. Review release ведёт
в релиз к незаполненным правам; исправленный пункт исчезает из Needs attention.
Планируемая дата не означает запланированную публикацию. Каталог показывает
состояние сейчас, аналитика — отдельный период; отсутствие данных не рисуется нулём.
Даты, количество треков и события демонстрационные. Переходы и изменения состояний
здесь описывают поведение будущего приложения, а не работающий прототип.

Dim остаётся основным нейтральным вариантом исходной ветки. В этой копии White
развивается как самостоятельная светлая альтернатива: paper-base, белые рабочие
поверхности, холодный raised-слой и тёмные media-пластины. Все три режима
сохранены в исходной системе, а light-overrides ограничены этой веткой.
Оболочка демонстрирует пустой слот первого релиза, не полный набор состояний дашборда.
Мобильное меню открывается поверх содержимого; задуманы закрытие через кнопку,
Escape и фон, возврат фокуса к триггеру и блокировка прокрутки фона. Это описание
поведения для реализации, а не утверждение о работающем прототипе.

Проверены снимки шести фреймов и отсутствие обрезанного содержимого.
Независимая визуальная проверка этих шести PNG: `ship`, без существенных
замечаний к английским подписям, компоновке и сохранению контента на телефоне.
Проверка относится только к статичным макетам, не к доступности работающего UI.
Актуальные английские превью находятся в `output/artist-dashboard-v2/`
по ID выше. `output/artist-shell-v1/` — предыдущие русские превью.
Это локальные изображения для проверки, исходник этой ветки — `web-artist-white.pen`.
Из-за сбоя отрисовки Pencil технические фреймы сохранены скрытыми с префиксом
`Recovery /`; актуальны только ID выше. Исходные 11 разделов системы не менялись.
Для Music Mobile скрытый `Recovery / 14B` также оставлен только как техническая
копия; актуальный экран — `JZHt8`.

- [x] Владелец проверил оболочку и подтвердил Dim как основную нейтральную тему.
- [x] Подготовить статическую матрицу новых компонентов в Light и Dim, а также
  focus/pressed/disabled; runtime-проверка остаётся отдельной задачей.
- [x] Проработать результаты поиска, панель уведомлений и контекстные действия строк.
- [x] Сделать дашборд возвращающегося артиста: текущий релиз, следующий шаг,
  задачи, каталог и явное отсутствие данных аналитики.
- [ ] Владелец проверил дашборд и русские заметки над экранами.
- [x] Дополнить состояния дашборда: всё завершено, данные собираются,
  loading/error и первый вход.
- [x] Сделать заполненный Tracks-каталог в desktop и mobile.
- [x] Сделать Releases-вкладку и состояния фильтров/пустого результата.
- [x] Сделать Audio и Artwork мастера создания релиза в desktop/mobile,
  включая загрузочные, ошибочные и успешные состояния.
- [x] Сделать Details мастера в desktop/mobile и компактное сравнение
  validation, save и progression-состояний.
- [x] Сделать Contributors / Rights в desktop/mobile и состояния missing role,
  incomplete rights, recovery и готовности к Review.
- [x] Сделать Final Review в desktop/mobile: единая сводка, blockers,
  возврат к точному шагу, submit/error/success и честная граница delivery.
- [x] Сделать release workspace после отправки в desktop/mobile и матрицу
  Review in progress / Changes requested / Approved / load error.
- [x] Сделать экран workspace: ответ на reviewer feedback и выполнение
  Changes requested с разделением required change и recommendation.
- [x] Сделать экран workspace: задачи с дедлайнами, ответственными и
  блокирующими замечаниями в desktop/mobile.
- [x] Сделать delivery plan, submission readiness и post-release в desktop/mobile,
  не смешивая план, handoff, публикацию Bitrate и внешние площадки.
- [x] Сделать Profile details, catalog/layout и save/verification states
  в desktop/mobile с явной границей публичных и приватных данных.
- [x] Сделать настройки Account, Security и Notifications в desktop/mobile,
  не выдавая demo-состояния за подключённые backend-функции.
- [x] Завершить Settings: Appearance, честная граница localization runtime,
  Connected services, Team roles и отдельные review для dangerous actions.
- [x] Сделать Promotion overview, campaign creation и AI-assisted editable drafts
  в desktop/mobile с отдельным human approval.
- [x] Завершить Promotion: materials/calendar, paid setup, source-defined report
  и recoverable channel states в desktop/mobile.
- [x] Сделать Analytics overview, release/track drill-down и period/source controls
  в desktop/mobile с определениями, источником, периодом, timezone и freshness.
- [x] Закрыть Music metadata/archive states и multi-track ordering в desktop/mobile.
- [x] Заполнить dashboard summary и собрать общую QA-матрицу Light/Dim,
  focus/pressed/disabled и длинных/пустых состояний.
- [x] Завершить результаты поиска, панель уведомлений и контекстные действия
  строк в desktop/mobile и consequence-aware state matrix.
- [ ] Вне статического Pencil-дизайна: runtime-QA клавиатуры, измеренного контраста
  и tablet-width; подтвердить delivery-ограничения после появления технических
  требований.

Финальный dashboard package: `tm3ER` / `RBGCQ` — desktop/mobile summary;
`O45LSf` — cross-theme & interaction QA matrix; русские заметки — `nIlVf`, `lUuBo`.
PNG: `output/artist-dashboard-final-v1/final/` и `output/artist-qa-matrix-v1/final/`.

Финальный interaction package: `ZvVcc` / `FTtu0` — global search desktop/mobile;
`n92Mi` / `a39Ou` — notification center desktop/mobile; `EKQj7` — row context
actions и consequence rules. Русские заметки: `x6HSxe`, `ZVIAP`, `m2zgI`.
PNG: `output/artist-search-notifications-actions-v1/final/`.

Финальный технический проход дизайн-исходника: 95 variables, 44 reusable components,
215 ref instances, 13 уникальных component targets и 0 broken refs. В свойствах
используются 89 связанных переменных, неизвестных variable references нет; root-фреймов
с незавершённым `placeholder: true` нет. Доступность всех 18 уникальных image URLs
проверена, исправленный Search desktop экспортирован повторно.

Основной design backlog разделов 2–9 закрыт. Новые core-экраны не требуются:
дальше остаются подтверждение владельцем, техническая проверка реализации и
будущие направления из раздела 10, которые запускаются только отдельно.

Краткая фиксация визуальных правил artist-поверхности — в соседнем `DESIGN.md`.
Это описание использованной части системы; актуальные White tokens и системные
фреймы находятся в `web-artist-white.pen`.

Код приложения не менялся. Коммит и пуш в этой итерации не выполнялись.

White pass 03: экраны `16`–`20` переведены на Luminous Studio вместе со всеми
desktop/mobile/state-вариантами. Актуальные фреймы: `y4r5Lx`, `mP3EG`, `fuFvh`,
`aISEQ`, `iW0o7`, `nygmf`, `g9VtYR`, `YkHj6`, `ojDoL`, `V5qAC`, `JYEaf`,
`gK5Ae`, `FgB5s`, `Z8Pcr`. Сохранены разные музыкальные вставки для каждого
шага; на светлых поверхностях снижены их opacity и тяжесть elevation. Финальный
review отдельно проверен после исправления контраста release overview.
Структурная проверка всех 14 фреймов не выявила clipped или collapsed content.
PNG: `output/artist-white-16-20-v1/final/`.

White pass 04: тёмные error-карточки в `YkHj6`, `JYEaf`, `Z8Pcr` заменены
светлыми semantic surfaces. Экраны `21`–`24` переведены на White вместе с
адаптивами и state matrix: `EvWT5`, `mf4LZ`, `F89st`, `dMPfF`, `U2eW4A`,
`r9U1c`, `vvFQO`, `IXDcH`, `W8wV8`, `tZ48E`. Тёмные image fades на мобильном
workspace/feedback и в Tasks/Delivery summary исправлены на мягкие белые
градиенты. Все 13 затронутых фреймов прошли structural check без clipping.
PNG: `output/artist-white-21-24-v1/final/`.

White pass 05: экраны `25`–`28` обновлены вместе с адаптивами — `i8mjf0`,
`mqtop`, `wMMpY`, `MMKvM`, `E8FXx`, `bo6y5`, `umRNn`, `m2TMzU`. Delivery,
post-release и profile-сценарии используют собственные patchbay, waveform,
listening spectrum, artist spectrum и proofing assets; тёмных несемантических
surfaces в затронутых фреймах не осталось. Все восемь фреймов прошли structural
check без clipping. PNG: `output/artist-white-25-28-v1/final/`.

White pass 06: экраны `29`–`32` переведены на White вместе с mobile-вариантами:
`NWNpZ`, `fkSss`, `h6L41N`, `uKCn1`, `bxxmR`, `E5mFT5`, `nPhsF`, `grIwc`.
Profile save/verification и Settings Account/Security/Notifications теперь
используют Light theme tokens, белые raised/glass surfaces и светлые semantic
states. Hardcoded dark gradients и тяжёлые тени удалены, фоновые музыкальные
вставки приглушены до `0.16` на desktop и `0.09` на mobile. Все восемь фреймов
прошли snapshot и structural check без clipping. PNG:
`output/artist-white-29-32-v1/final/`.

White pass 06 elevation correction: на `29`–`32` и mobile-вариантах снижены
тени карточек и controls, tab bars получили отдельный мягкий elevation, а glow
активной вкладки и primary actions уменьшен. Повторный structural check — без
clipping. Актуальный PNG export: `output/artist-white-29-32-v2/final/`.

White pass 07: экраны `33`–`36` обновлены вместе с mobile-вариантами —
`l0AdPz`, `U686R`, `finkk`, `oP5z6`, `Urz87`, `a4Qsh`, `nEVZv`, `eY3tU`.
Appearance корректно показывает Light как selected, сохраняя честные Dark/Dim
preview thumbnails. Connected Services, Team & Safety и Promotion переведены
на светлые surfaces и выровненную elevation-систему; тёмных несемантических
поверхностей не осталось. Все восемь фреймов прошли snapshot и structural check
без clipping. PNG: `output/artist-white-33-36-v1/final/`.

White pass 08: campaign workflow `37`–`40` обновлён вместе с mobile-вариантами:
`DKSYY`, `Z0TTDf`, `HZ3XZ`, `QGs6i`, `w3Y3FF`, `k5rtxH`, `dubJG`, `Gg2gt`.
Creation, AI draft, materials/calendar и paid setup используют White surfaces,
мягкий elevation и светлые semantic warnings; декоративные изображения приглушены,
а release artwork сохранён полноцветным. Тёмных несемантических поверхностей нет.
Все восемь фреймов прошли snapshot и structural check без clipping. PNG:
`output/artist-white-37-40-v1/final/`.

White pass 09: reporting и analytics `41`–`44` обновлены вместе с mobile:
`pSqbU`, `icBrr`, `ekMe2`, `ScfJe`, `gCinE`, `v2W7F6`, `H3pb4S`, `NrbGO`.
Campaign recovery, overview, release drill-down и data states используют White
surfaces, спокойную chart-сетку и подписанные semantic состояния. Тёмных
несемантических поверхностей нет; все восемь фреймов прошли snapshot и structural
check без clipping. PNG: `output/artist-white-41-44-v1/final/`.

White pass 10: music operations и dashboard summary `45`–`48` обновлены вместе
с mobile-вариантами: `RlAV8`, `g0Lz3`, `M0sfEp`, `Lwatu`, `Ehnte`, `Y2k3a`,
`tm3ER`, `RBGCQ`. Metadata, track order, lifecycle/archive и performance summary
используют White surfaces, мягкий elevation и светлые semantic states; release
artwork сохранён полноцветным. Тёмных несемантических поверхностей нет. Все восемь
фреймов прошли snapshot и structural check без clipping. PNG:
`output/artist-white-45-48-v1/final/`.

White pass 11: interaction package `49`–`52` обновлён: `O45LSf`, `ZvVcc`,
`FTtu0`, `n92Mi`, `a39Ou`, `EKQj7`. QA matrix сохраняет отдельные реальные
Dark/Light/Dim samples внутри светлой оболочки; Search, Notification Center и
Row Context Actions используют White surfaces и мягкий scrim. Исправлены
hardcoded white labels вне theme samples. Все шесть фреймов прошли snapshot и
structural check без clipping. PNG: `output/artist-white-49-52-v1/final/`.

White pass 11 contrast correction: в `EKQj7` исправлены белые routine-action
labels и icons на белых surfaces desktop menu и mobile bottom sheet. Archive и
disabled Delete сохранили отдельную семантику. Повторный export:
`output/artist-white-49-52-v2/final/`.
