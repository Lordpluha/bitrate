---
name: Bitrate for Artists — White System
description: Светлая визуальная система рабочего кабинета артиста.
colors:
  color-primary: "#6D28D9"
  color-on-primary: "#FFFFFF"
  color-accent: "#2563EB"
  color-background: "#F6F7FB"
  color-card: "#FFFFFF"
  color-border: "#D6DEEB"
  color-text: "#151826"
  color-text-secondary: "#566074"
typography:
  body:
    fontFamily: Manrope
  display:
    fontFamily: Space Grotesk
  label:
    fontFamily: Manrope
    fontSize: "14px"
    fontWeight: 600
rounded:
  card: "12px"
spacing:
  stack: "16px"
  section: "24px"
components:
  button-primary:
    backgroundColor: "{colors.color-primary}"
    textColor: "{colors.color-on-primary}"
    typography: "{typography.label}"
    height: "44px"
    padding: "0px 18px"
  card:
    backgroundColor: "{colors.color-card}"
    rounded: "{rounded.card}"
---

# Design System: Bitrate for Artists — Pencil

## Overview

**Creative North Star: "Luminous Studio"**

Светлая студийная поверхность с тёплым paper-base, холодными техническими панелями
и точными violet/cobalt-сигналами. Белый здесь не пустота: иерархию создают
плотность тона, тонкая спектральная кромка и редкие тёмные media-пластины.
Музыкальную индивидуальность по-прежнему несут обложки и playback-контекст.

Это локальная запись существующего визуального мира, а не новая айдентика или
спецификация реализованного приложения. Область действия — макеты этого каталога.
Источник истины этой ветки — `web-artist-white.pen`, включая локальные
`white-*` tokens и системные фреймы 01–08. Dark и нейтральный Dim остаются
отдельными ветками; светлые значения не переносятся в них автоматически.

**Key Characteristics:**

- Молочно-белое основание, холодные многоуровневые поверхности и спектральная кромка.
- Тёмные media-пластины применяются только для artwork и playback, где усиливают фокус.
- Space Grotesk в крупных заявлениях, Manrope в интерфейсе и данных.
- Статус сопровождается текстом; отсутствие данных обозначается явно.
- На телефоне сохраняются содержание и следующий шаг.

Срез: 13 сентября 2026. Светлая система применена и визуально проверена на
`TzwhT` — Component Masters, `nfrfZ` — Landing Component Masters,
`V6EMrd` — Extended Color, `MWEdQ` — Foundations, `o69aC` — Color, `Y3N2l` — Type & Layout,
`z6bCt` — Controls & Feedback, `P3Oan` — Music Content,
`wsvY5` — Player System, `GOiUO` — Patterns & States и
`m9v9Im` — Iconography & Governance. Dark и Dim в theme-comparison, artwork,
player-preview и semantic-demo сохранены намеренно; это образцы контента и тем,
а не неприменённые части White-системы.

Первый продуктовый проход White завершён на `pNeG9` — desktop shell,
`R5LDZj` / `aA6Id` — mobile closed/open navigation, `H3Itmt` —
shared interface patterns и `QurL2` / `bu2rk` — returning dashboard
desktop/mobile. Существующие музыкальные изображения сохранены как контент,
а не перекрашены декоративным фильтром. После snapshot-review боковые панели
лишены тяжёлой боковой тени, current release переведён на нейтральную светлую
поверхность, а mastering-console убран из attention-карточек, где он снижал читаемость.

Второй продуктовый проход White завершён на `tWPhZ` — dashboard state matrix,
`DhsgM` / `JZHt8` — Tracks desktop/mobile и `dg76H` / `oWM3u` / `mDs8D` —
Releases desktop/mobile и filter/empty states. Desktop-каталоги используют
музыкальные изображения только как очень слабую фоновую фактуру; на телефоне
эти декоративные слои отключены. Табличные разделители переведены на светлый
border token, а status surfaces используют собственные semantic tints.

Третий продуктовый проход White завершён на экранах 16–20: Audio, Artwork,
Details, Contributors & Rights и Final Review вместе с mobile и compact state
вариантами. Тёмные рабочие панели заменены белыми и холодными raised-surfaces,
тяжёлые тени ослаблены, а secondary Save & exit отделён от контекстных primary
действий. Музыкальные вставки намеренно различаются по шагам: XLR/preamp для
аудио, proofing table для artwork, waveform для metadata, studio console для
rights и cover/proofing treatment для review. На мобильных экранах изображения
сильнее приглушены, чтобы не конкурировать с формами и progression gate.

Четвёртый проход охватывает `21`–`24`: Release Workspace, Reviewer Feedback,
Release Tasks и Delivery Plan во всех предусмотренных desktop/mobile/state
вариантах. Каждый сценарий сохраняет собственную музыкальную фактуру — release
waveform, artwork proofing, signal summary и patchbay — с белой fade-подложкой
вместо серых или тёмных полос. Error и changes-requested состояния используют
светлые semantic tints; контент, blocker и следующее действие остаются читаемыми
без возврата к Dark-панелям.

Пятый проход переводит `25`–`28` в ту же систему: Delivery Status, Post-release,
Profile Details и Profile Catalog & Layout. Переиспользуемые shell, tabs, cards,
status rows и actions сохраняют общий контраст, а музыкальные фактуры различаются
по смыслу: patchbay для handoff, release/listening spectra для результата и
artist spectrum/proofing surface для публичного профиля. На телефоне декоративные
слои слабее, но структура, статусы и следующее действие полностью сохранены.

## Colors

Deep violet выделяет действия и выбор на светлом фоне; cobalt поддерживает
информационные состояния, а pink появляется только как музыкальный спектральный акцент.

- **Primary:** `color-primary` — заливка основных кнопок и акцент выбора;
  `color-accent` — вторичные текстовые переходы и поддерживающие акценты.
- **Neutral:** `color-background` — paper-base; `color-card` — основные панели;
  `color-border` — границы и разделители; `color-text` — основной текст;
  `color-text-secondary` — пояснения и метаданные.
- **Media plate:** глубокий ink/navy разрешён для artwork, desktop player и
  now-playing surface; это контрастный функциональный слой, а не вторая dark-тема.
- Семантические предупреждения, ошибки, успех и информация используют
  соответствующие роли исходной DS. Их полная палитра остаётся в `.pen`.

**The Status Rule.** Смысл состояния передаётся подписью, при необходимости
иконкой; цвет дополняет сообщение.

## Typography

Space Grotesk формирует крупные системные заголовки и короткие визуальные заявления.
Manrope отвечает за навигацию, контролы, таблицы, подписи и метаданные. Пара
разделяет характер и утилитарность без лишнего количества шрифтов. Кнопочная
подпись выделена насыщенностью; точные параметры записаны во frontmatter.
Полная шкала размеров и веса остаётся в исходной DS.

Видимый artist-интерфейс на английском. Русские пояснения находятся в отдельных
редактируемых фреймах за границами UI. Это не свидетельство работающей локализации.

## Layout

Широкая оболочка разделяет постоянную навигацию, верхнюю панель и рабочую область.
В проверенном desktop-фрейме (1440 × 1040) боковая панель занимает (248px),
верхняя — (88px). Основная рабочая колонка шире вспомогательной; карточки
группируют связанные задачи, а не изображают независимые рекламные блоки.

На проверенной ширине телефона (390px) содержимое выстроено в одну колонку,
внешний отступ — `spacing.section`, промежутки между карточками — `spacing.stack`.
Каталог становится компактными строками; навигация представлена закрытой
оболочкой и отдельным открытым меню. Это образцы адаптации, не установленные
CSS-breakpoints; промежуточные ширины и поведение прокрутки в браузере не проверены.

При адаптации таблицы Music в мобильный список сохраняются название, версия и
длительность, статус, Updated, Release, playback и контекстное действие. Управляющие
вкладки, поиск, фильтры, активная сортировка и Reset остаются перед списком.

При адаптации таблицы Releases в мобильный список сохраняются тип, количество,
статус, Release, Updated и контекстное действие. Закреплённые фильтры сохраняют
контекст применённого отбора, а в пустом отфильтрованном состоянии **Clear filters** остаётся вторичным действием.

Конкретный порядок блоков дашборда, демонстрационные даты и наполнение описаны
в [web-artist.md](web-artist.md), а не закреплены как правило для всех страниц.

## Elevation & Depth

В светлой системе глубину задают paper-base, белая поверхность, холодный raised-слой,
тонкие границы и разделители. Мягкая тень разрешена только крупным media-пластинам
и floating-состояниям; обычные карточки не требуют заметной тени. Постоянная боковая
панель отделяется однопиксельной границей и практически незаметной тенью. Открытое мобильное
меню — отдельное состояние оболочки; его затемнение и геометрия остаются в
исходном фрейме. Тени и анимационные токены здесь не выводятся из статичных снимков.

## Shapes

Карточки имеют мягкое скругление `rounded.card`; основные кнопки — форму капсулы.
Обложки обрезаны внутри своих контейнеров. Прямые разделители помогают читать
списки и таблицы. Точный радиус прочих контролов наследуется от мастеров,
а не унифицируется по случайному элементу дашборда.

## Components

- **Основная кнопка:** мастер `BP7Z8`, капсула, параметры из frontmatter,
  текстовое действие с функциональной иконкой Lucide. На узком экране
  основные действия используют доступную ширину контейнера. На рабочем экране
  насыщенный primary принадлежит действию текущего контекста; глобальное действие
  становится secondary, если иначе возникает конкуренция двух равных CTA.
- **Карточки:** нейтральная поверхность, тонкая граница, заголовок и связанное
  содержание; разделители отделяют строки и действие от сведений о релизе.
- **Dashboard hierarchy:** текущий релиз использует одну тёмную media-пластину;
  Needs attention — тёплую warning-поверхность; каталог остаётся белым,
  Upcoming получает холодный blue tint, Recent activity — green tint,
  Listening data — мягкий violet/pink tint. Цвет поддерживает назначение,
  но статус всегда остаётся подписанным.
- **Навигация:** иконка и подпись; выбранный раздел отличается фиолетовой
  поверхностью и контуром. White sidebar отделён от paper-base холодной границей;
  mobile drawer сохраняет ту же навигацию, явное закрытие и затемнение фона.
  Мобильная оболочка сохраняет вход в меню, поиск, уведомления и создание релиза.
- **Поиск:** спокойное поле в верхней панели desktop; на телефоне показана
  точка входа. В Music локальный поиск и фильтры расположены перед каталогом;
  результаты, открытые меню и интерактивный поиск пока не проверены.
- **Статусы и строки каталога:** название релиза, краткие метаданные,
  явная подпись состояния и точка перехода. Пять проверенных моментов
  формируют устойчивую логику: **FIRST ENTRY** ведёт к созданию первого релиза;
  **ALL CLEAR** сохраняет доступ к каталогу; **COLLECTING DATA** явно говорит о поступлении
  данных и не подменяет их нулём; **LOADING** сохраняет постоянный каркас скелетона
  в существующем `color-border`; **LOAD ERROR** объясняет, что сохранённая работа
  не изменена, и даёт естественное восстановление через **Try again** и переход в Music.
- **Общие паттерны:** таблица, фильтры, вкладки, загрузка, ошибка,
  меню аккаунта, подтверждение и подсказка собраны в `H3Itmt`.
  Это визуальные образцы, не реализованные интерактивные компоненты.
- **Пошаговая загрузка:** сохраняет видимыми текущий шаг и черновик;
  файл показывает явные состояния выбора, загрузки, обработки, ошибки и готовности.
  Восстановимая ошибка даёт повтор или отмену, а заблокированный переход объясняет,
  какое условие ещё не выполнено. Технические ограничения указывать только после подтверждения.
- **Формы:** обязательность и optional-статус полей обозначены явно; ошибка показана
  у связанного поля и не стирает введённые данные. Ошибка сохранения сохраняет форму
  и даёт повтор; недоступный переход объясняет незаполненное обязательное условие.
- **Final Review:** **Submit for review** отправляет релиз только на проверку Bitrate и не
  означает доставку или публикацию на внешних площадках. При восстановимой ошибке
  черновик и все введённые данные сохраняются, а повтор остаётся явным действием.
- **Release Workspace:** во всех состояниях проверки сохраняет текущий статус, следующее
  действие, выбранный мастер и историю переходов. **Approved** означает только
  завершение проверки Bitrate; внешняя доставка остаётся отдельным этапом.
- **Reviewer Feedback:** обязательное исправление содержит причину, связанное действие,
  ответ и явный resolved-статус; только required change влияет на счётчик готовности.
  Recommendation остаётся необязательной. Ошибка повторной отправки сохраняет ответы,
  а resubmit возвращает релиз на внутреннюю проверку Bitrate, не публикует его.
- **Release Tasks:** задача сохраняет название, статус, срок, ответственного и явную
  блокирующую пометку. Ближайший срок сопровождается часовым поясом; отсутствие срока
  показывается как No due date. Review blocker ведёт к связанному feedback и не означает,
  что внешняя публикация или доставка уже настроена.
- **Delivery:** план, готовность пакета и внешний handoff — разные состояния.
  Дата всегда читается вместе с часовым поясом; Not connected, Pending и Unavailable
  имеют собственное объяснение. Primary-действие не называется Submit, пока пользователь
  не увидел готовый пакет и пока макет не подтверждает реальную интеграцию.
- **Post-release:** Live on Bitrate не распространяется на внешние площадки.
  Ссылка показывается только как Available, Pending или Unavailable; сигналы содержат
  источник и время обновления. Follow-up задачи остаются действиями человека.
- **Music Metadata:** track и release details сохраняют общий catalog context, но
  редактируются отдельными вкладками. Required, Optional и Read only видны до ввода;
  save error не стирает форму. Open workspace ведёт к задачам и feedback, а не
  подменяет сохранение metadata. Неподтверждённые delivery-лимиты не показываются.
- **Multi-track Order:** EP/Album имеет сохранённую draft sequence. Drag-and-drop
  сопровождается Move up / Move down; нумерация меняется после Save order. Per-track
  Needs details и Processing объясняют, почему Review остаётся недоступным.
- **Music Lifecycle:** Draft, Uploading, Processing, Processing error, In review и
  Published используют подпись, иконку, цвет и следующий шаг. Статусы макета остаются
  иллюстративной моделью до сверки с реализацией.
- **Archive & Delete:** Published release архивируется и может быть восстановлен;
  analytics, comments, history и workspace сохраняются. Permanent delete доступен
  только подходящему draft, называет точный объект и требует typed confirmation.
- **Artist Profile:** публичные media/details, каталог и layout отделены от login,
  security и billing. Preview показывает draft, но не подменяет Save. Featured release
  выбирается из опубликованного каталога; недоступный listener-history block объясняет
  границу между artist и listener profile. Ошибка сохранения сохраняет остальные поля.
- **Verification:** это отдельный будущий процесс со статусами Not applied, Submitted,
  Needs information и Approved. Badge не появляется до подтверждённого review;
  неизвестные критерии не придумываются, а действие остаётся unavailable.
- **Account Settings:** приватные email и sign-in methods не смешиваются с публичным
  artist profile. Список провайдеров отражает только подтверждённую реализацию;
  неподключённые варианты показываются как unavailable, а demo-данные подписываются.
- **Security:** password, 2FA, recovery codes и active sessions — самостоятельные
  сценарии. Чувствительное действие требует явного подтверждения, объясняет какие
  сессии завершатся и оставляет понятный путь восстановления доступа.
- **Notifications:** пользователь выбирает тип события отдельно от канала доставки.
  In-app, Email и Push имеют собственные состояния; недоступный канал не маскируется,
  а обязательное поведение security-сообщений следует фактической реализации.
- **Appearance:** Dark, Light и Dim используют существующие theme tokens; выбранная
  тема отличается от статического preview. Density меняет интервалы, но не скрывает
  сведения. Language selector недоступен, пока runtime-локализация не реализована.
- **Connected Services:** карточка сервиса всегда показывает состояние, доступы
  и последствия disconnect. Connect не появляется для неподтверждённого провайдера;
  internal review, social publishing и external delivery не смешиваются.
- **Team & Safety:** роль и её границы видны до приглашения. Owner отдельно от Manager
  и Viewer; pending invite не считается активным участником. Sign-out, deactivation
  и deletion ведут в отдельный review, а не выполняются немедленно.
- **Promotion Overview:** Draft, Scheduled, Active, Paused и Completed отражают
  lifecycle кампании, не вероятность успеха. Reporting без подтверждённого источника
  показывается как unavailable, а не как нулевой результат.
- **Campaign Creation:** release, goal, audience, channels, timing и materials
  проходят последовательный review. Continue меняет шаг, но не запускает кампанию;
  paid spend требует отдельного budget/limit confirmation.
- **AI-assisted Draft:** предложение строится только на видимом brief и metadata,
  остаётся редактируемым и версионируемым. Regenerate сохраняет текущую редакцию;
  Save не публикует, а final copy и channel подтверждает артист.
- **Campaign Materials:** copy, approved artwork, destination и schedule остаются
  редактируемыми до Review. Channel preview явно помечается как preview и не равен
  реальному rendering или публикации; Save сохраняет только draft.
- **Paid Promotion:** amount, daily cap, period и auto-renew повторяются в launch review.
  Demo values не являются тарифом или рекомендацией. Без provider, billing source
  и explicit consent запуск недоступен; неподтверждённый forecast не показывается.
- **Campaign Reporting:** каждая метрика имеет definition, source, period, timezone
  и updated time. External unavailable не подменяется нулём. Channel retry сохраняет
  draft/schedule и не дублирует уже доставленное действие.
- **Artist Analytics:** overview и release/track drill-down используют один evidence
  contract: definition, source, period, timezone и updated time всегда читаются вместе.
  Смена release/track scope пересчитывает все карточки, графики и таблицы в экране.
- **Analytics Data States:** observed zero, no data yet, delayed update и load error —
  разные состояния с отдельной причиной и следующим шагом. Recoverable error сохраняет
  выбранные period, comparison, timezone, source и последнее валидное представление.
- **Analytics Accessibility:** серия имеет подпись, значение и легенду; цвет усилен
  формой и текстом. Те же значения доступны как таблица. Сравнение периодов допустимо
  только для одинаковой длительности, источника и часового пояса.
- **Revenue & Forecast:** это отдельный future-концепт. Recorded fact и estimated
  forecast визуально и текстово разделены; без подтверждённого источника, модели,
  входов, диапазона и ограничений значение остаётся Unavailable, а не нулём.
- **Dashboard Performance Summary:** выбранный period, comparison, source, timezone
  и freshness относятся ко всем показателям экрана. Сводка использует только
  Bitrate-owned данные; внешние платформы и доход не подменяются demo-числами.
  Current release задаёт рабочий контекст, Needs attention — ближайшие решения,
  а каталог, даты и события остаются вторичным уровнем.
- **Cross-theme QA:** `O45LSf` фиксирует визуальный parity Dark / Light / Dim,
  Default / Hover / Focus / Pressed / Disabled и стресс-кейсы контента. Статус
  не передаётся одним цветом. Матрица служит reference для реализации, но не
  подтверждает keyboard runtime, измеренный WCAG contrast, motion или breakpoints.
- **Global Search:** query и scope сохраняются при выборе результата. Каждый результат
  сообщает тип объекта, контекст и естественное действие; selected preview ускоряет
  оценку, но не заменяет переход. Keyboard hints остаются runtime-спецификацией.
- **Notification Center:** событие всегда связано с объектом, временем и следующим
  шагом. Action required отделяется от updates; unread имеет не только цветовой сигнал.
  Mark all as read меняет read-state, но не удаляет историю.
- **Row Context Actions:** меню зависит от lifecycle объекта. Routine, archive и
  permanent delete визуально разделены; недоступное действие объясняется состоянием.
  Mobile использует bottom sheet, а destructive flow требует отдельного review.
- **Логотип:** использовать оригинальный мастер `OVOcb` из скопированной DS.
  Его текущий lockup не объявляется окончательным глобальным wordmark бренда.

**The Evidence Rule.** Статический макет фиксирует внешний вид; работу переходов,
hover, focus, disabled, клавиатуры, загрузки и анимации подтверждают отдельно.

## Do's and Don'ts

- **Do** Наследовать переменные, мастера и оригинальный логотип из `.pen`.
- **Do** Сохранять читаемость статуса, содержания и следующего действия при адаптации.
- **Do** Обозначать отсутствие данных и демонстрационное наполнение явно.
- **Don't** Подменять нейтральную оболочку декоративной неоновой сценой; обложки остаются самостоятельным музыкальным материалом.
- **Don't** Выдавать макеты, демонстрационные числа и планируемые возможности за работающий продукт.
- **Don't** превращать White в бесконтрольную инверсию Dark или переносить
  светлые overrides в Dark/Dim без отдельной проверки theme tokens и читаемости.

## White pass 06 — Profile states and Settings

Экраны `29`–`32` и их mobile-варианты используют Light mode как реальную тему,
а не локальную инверсию отдельных карточек. Profile save/verification, Account,
Security и Notifications построены на белых surfaces, спокойных серо-синих
границах и лёгком elevation. Success, warning, error и info остаются
семантическими, но переведены на светлые tint-поверхности; музыкальные spectrum
и signal-routing вставки приглушены сильнее на mobile. Тёмные hardcoded gradients
и glass-surfaces заменены на White equivalents, при этом primary violet CTA
сохраняет белый текст и визуальный приоритет.

Elevation correction: крупные карточки используют спокойную тень
`#24324A12 / y4 / blur14 / spread-8`, controls — ещё легче. Tab bar получил
собственную компактную тень, а active underline использует только слабый violet
focus cue. Поэтому вкладки и контент теперь принадлежат одному уровню глубины.

## White pass 07 — Appearance, Services, Team and Promotion

Экраны `33`–`36` и mobile-варианты продолжают Luminous Studio без возврата к
тяжёлому elevation. В Appearance оболочка и controls светлые, но миниатюры
Dark, Light и Dim сохраняют реальный вид каждой темы; выбранной в White-файле
явно отмечена Light. Connected Services, Team & Safety и Promotion используют
светлые карточки, тонкие границы и самостоятельные success/warning/error/info
состояния. Фото-вставки остаются музыкальным контекстом с opacity `0.16` на
desktop и `0.10` на mobile, а не становятся доминирующим фоном.

## White pass 08 — Campaign workflow

Экраны `37`–`40` и mobile-варианты переводят полный campaign workflow в White:
creation, AI-assisted editable draft, materials/calendar и paid setup. Step bars,
формы, review sidebars и launch summaries используют одну спокойную elevation-
иерархию. Предупреждения о budget, consent и external delivery остаются заметными
за счёт semantic tint и border, а не тёмной заливки. Decorative campaign imagery
имеет opacity `0.16–0.18` на desktop и `0.10–0.11` на mobile; release artwork
остаётся полноцветным продуктовым контентом.

## White pass 09 — Reporting and analytics

Экраны `41`–`44` и mobile-варианты переводят campaign reporting, analytics
overview, release drill-down и data states в White. Графики используют светлую
нейтральную сетку, фиолетовый focus series и подписанные значения; таблицы и
comparison controls остаются на одном спокойном elevation-уровне. Observed zero,
collecting, delayed и load error разделены semantic tint, подписью и следующим
действием. Аналитические banner assets сохраняют музыкальную связь при opacity
`0.18` на desktop и `0.10` на mobile.

## White pass 10 — Music operations and dashboard summary

Экраны `45`–`48` и mobile-варианты переводят metadata editor, EP track order,
music lifecycle/archive и performance dashboard в White. Формы и каталожные
строки используют белые surfaces с тонкими разделителями; сохранение, порядок,
архивация и recovery сохраняют явный следующий шаг. Полноцветные release artwork
не приглушаются, а session/archive/performance banners работают как музыкальный
контекст с opacity `0.18` на desktop и `0.10` на mobile. Dashboard metrics и
attention states остаются визуально различимыми без тяжёлого elevation.

## White pass 11 — QA and global interaction surfaces

Экраны `49`–`52` переводят cross-theme QA, global search, notification center
и row context actions в White. QA matrix использует светлую оболочку, но Dark,
Light и Dim samples получают собственный локальный theme mode и остаются
достоверными. Search и context menus используют белые raised surfaces; selected
result и action priority читаются через tint, border и typography. Notification
drawer светлая, а фон страницы отделён мягким scrim `#24324A38`, без почти чёрной
подложки. Product artwork сохраняется полноцветным, decorative banners приглушены.
Routine actions в desktop context menu и mobile bottom sheet используют тёмные
labels и серо-синие icons; Archive остаётся amber, disabled Delete — subdued.
