# Security Policy

## 🔒 Supported Versions

Мы поддерживаем безопасность следующих версий проекта:

| Version | Supported          |
| ------- | ------------------ |
| master  | ✅ Активная поддержка |
| develop | ✅ Активная разработка |
| < 1.0   | ❌ Не поддерживается |

## 🐛 Reporting a Vulnerability

Безопасность наших пользователей - наш главный приоритет. Если вы обнаружили уязвимость в проекте, пожалуйста, сообщите нам об этом **конфиденциально**.

### Как сообщить об уязвимости

**НЕ создавайте публичный issue** для сообщения об уязвимостях безопасности.

Вместо этого:

1. **Email:** Отправьте подробное описание уязвимости на:
   - 📧 **vladislavteslyukofficial@gmail.com**

2. **GitHub Security Advisories** (рекомендуется):
   - Перейдите на вкладку [Security](https://github.com/Lordpluha/spotify-clone/security)
   - Нажмите "Report a vulnerability"
   - Заполните форму с деталями

### Что включить в отчет

Для быстрого реагирования, пожалуйста, включите:

- **Тип уязвимости** (XSS, SQL Injection, CSRF, etc.)
- **Затронутые компоненты** (API, Web, Mobile, Desktop)
- **Шаги для воспроизведения** (step-by-step)
- **Потенциальное влияние** (что может сделать атакующий)
- **Предлагаемое решение** (если есть)
- **Версия проекта** или commit hash
- **Скриншоты/видео** (если применимо)

### Процесс обработки

После получения отчета об уязвимости:

1. ✅ **Подтверждение получения** - в течение **48 часов**
2. 🔍 **Анализ уязвимости** - в течение **7 дней**
3. 🛠️ **Разработка патча** - зависит от серьезности
4. 📦 **Релиз исправления** - с упоминанием автора (если не против)
5. 📢 **Публичное объявление** - после выхода патча

### Severity Levels

Мы используем следующую классификацию уязвимостей:

| Уровень | Описание | SLA Response |
|---------|----------|--------------|
| 🔴 **Critical** | Удаленное выполнение кода, полная компрометация системы | 24 часа |
| 🟠 **High** | Утечка данных пользователей, обход аутентификации | 48 часов |
| 🟡 **Medium** | Несанкционированный доступ к ограниченным данным | 7 дней |
| 🟢 **Low** | Раскрытие минимальной информации, DoS | 14 дней |

## 🛡️ Security Best Practices

При работе с проектом придерживайтесь следующих правил:

### Для разработчиков

- ✅ Никогда не коммитьте `.env` файлы с реальными credentials
- ✅ Используйте `.env.example` для документирования переменных
- ✅ Регулярно обновляйте зависимости: `pnpm update`
- ✅ Проверяйте уязвимости: `pnpm audit`
- ✅ Используйте pre-commit hooks для проверки секретов
- ✅ Валидируйте все пользовательские входные данные
- ✅ Используйте parameterized queries (Prisma делает это автоматически)
- ✅ Храните пароли только в хешированном виде (bcrypt/argon2)

### Для deployment

- ✅ Используйте HTTPS в продакшене
- ✅ Настройте CORS правильно (не используйте `*` в продакшене)
- ✅ Включите Rate Limiting (уже настроено в API)
- ✅ Используйте CSP (Content Security Policy)
- ✅ Храните секреты в secrets manager (не в .env файлах)
- ✅ Регулярно делайте бэкапы базы данных
- ✅ Мониторьте логи на подозрительную активность
- ✅ Используйте 2FA для критичных сервисов

## 🔐 Security Features

Проект уже включает следующие меры безопасности:

### Backend (NestJS API)

- ✅ **JWT Authentication** с refresh tokens
- ✅ **OAuth 2.0** (Google, Facebook, Discord)
- ✅ **2FA (Two-Factor Authentication)**
- ✅ **Rate Limiting** через `@nestjs/throttler`
- ✅ **CORS** настройка
- ✅ **CSP (Content Security Policy)**
- ✅ **Helmet** для HTTP headers security
- ✅ **CSRF Protection**
- ✅ **IP-based rate limiting and banning**
- ✅ **Fingerprint Authentication**
- ✅ **File Upload Security** через Multer с валидацией
- ✅ **SHA-3** для хеширования
- ✅ **Global Error Filters** для предотвращения утечки информации
- ✅ **Prisma** (защита от SQL Injection)

### Frontend (Next.js Web)

- ✅ **Server-side validation** через Server Actions
- ✅ **Zod validation** для всех форм
- ✅ **CSP Headers** через middleware
- ✅ **CORS** настройка
- ✅ **Secure cookies** (httpOnly, secure, sameSite)
- ✅ **MSW** для безопасного тестирования API

### Infrastructure

- ✅ **Docker** изоляция сервисов
- ✅ **Environment variables** через env.schema validation
- ✅ **PostgreSQL** с proper user permissions
- ✅ **Redis** для session management
- ✅ **Cloudflare** готовность (упоминается в stack)
- ✅ **Sentry** для мониторинга ошибок

## 📋 Security Checklist

Перед деплоем в продакшен:

- [ ] Все `.env` файлы в `.gitignore`
- [ ] Секреты перенесены в secrets manager
- [ ] HTTPS включен и настроен
- [ ] CORS настроен правильно (не `*`)
- [ ] Rate limiting протестирован
- [ ] Все зависимости обновлены (`pnpm audit`)
- [ ] CSP headers настроены
- [ ] Cookie settings: httpOnly, secure, sameSite
- [ ] Database backups настроены
- [ ] Monitoring и alerting настроены
- [ ] 2FA включен для admin аккаунтов
- [ ] SQL injection тесты пройдены
- [ ] XSS тесты пройдены
- [ ] CSRF защита работает

## 🏆 Responsible Disclosure

Мы благодарны исследователям безопасности, которые помогают делать проект безопаснее.

**Благодарности:**
- Исследователи, ответственно раскрывающие уязвимости, будут упомянуты в CHANGELOG
- По желанию, можем добавить вас в CONTRIBUTORS.md
- Для критичных уязвимостей можем рассмотреть вознаграждение (bug bounty)

## 📞 Контакты

- **Владислав Теслюк** (Lead Developer)
  - Email: vladislavteslyukofficial@gmail.com
  - GitHub: [@Lordpluha](https://github.com/Lordpluha)

---

**Благодарим за помощь в обеспечении безопасности проекта! 🙏**

*Последнее обновление: January 2026*
