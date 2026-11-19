---
sidebar_position: 3
---

# Authentication

В проекте два независимых auth-потока: для пользователей и для артистов. Оба используют одинаковые механизмы.

## Механизм

- **JWT** в **HttpOnly cookies** (не в заголовках)
- Два токена: `access_token` (5 мин) и `refresh_token` (30 дней)
- Сессии хранятся в PostgreSQL (`UserSession`, `ArtistSession`)
- Инвалидация через удаление сессии из БД

## Эндпоинты пользователей

| Метод | Маршрут | Описание |
|---|---|---|
| POST | `/api/v1/users/auth/register` | Регистрация |
| POST | `/api/v1/users/auth/login` | Вход |
| POST | `/api/v1/users/auth/refresh` | Обновить access token |
| POST | `/api/v1/users/auth/logout` | Выход (удаляет сессию) |
| GET | `/api/v1/users/auth/me` | Текущий пользователь |
| POST | `/api/v1/users/auth/2fa/enable` | Включить 2FA |
| POST | `/api/v1/users/auth/2fa/verify` | Верифицировать TOTP |
| POST | `/api/v1/users/auth/2fa/disable` | Отключить 2FA |
| GET | `/api/v1/users/auth/oauth/:provider` | OAuth редирект |
| GET | `/api/v1/users/auth/oauth/:provider/callback` | OAuth callback |
| POST | `/api/v1/users/auth/password/forgot` | Запросить сброс пароля |
| POST | `/api/v1/users/auth/password/reset` | Сбросить пароль по токену |

## Эндпоинты артистов

Аналогичны пользовательским, но по пути `/api/v1/artists/auth/*`.

## Регистрация и вход

```http
POST /api/v1/users/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

Ответ устанавливает `access_token` и `refresh_token` в HttpOnly cookies.

```http
POST /api/v1/users/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

## Refresh

```http
POST /api/v1/users/auth/refresh
```

Читает `refresh_token` из cookie, выдаёт новый `access_token`. Старый refresh-токен инвалидируется (rotation).

## Защищённые маршруты

Куки отправляются браузером автоматически. Для API-клиентов (Swagger, мобильное приложение):

```http
GET /api/v1/users/me
Cookie: access_token=eyJhbGciOiJIUzI1NiIs...
```

## OAuth 2.0

Поддерживаемые провайдеры: **Google**, **Facebook**.

```
# 1. Редирект на провайдера (слушатели; артисты — /api/v1/artists/auth/oauth/...)
GET /api/v1/auth/oauth/google

# 2. Провайдер редиректит обратно
GET /api/v1/auth/oauth/google/callback?code=...&state=...

# 3. API устанавливает cookies и редиректит на USER_WEB_HOST / ARTIST_WEB_HOST
```

**Существующий аккаунт с тем же email.** Если аккаунт уже подтвердил свой email
(`emailVerifiedAt`), провайдер привязывается к нему при первом входе: провайдер тоже ручается за
этот адрес, значит оба принадлежат одному человеку. Вход идёт тем же путём, что и по паролю,
поэтому включённая 2FA по-прежнему спрашивает код. Аккаунт с неподтверждённым email не
привязывается: адрес мог зарегистрировать кто угодно.

**Ошибки.** Браузер в этот момент выполняет навигацию верхнего уровня, поэтому API никогда не
отвечает телом ошибки: любой сбой — редирект на `/login?error=<код>` веб-приложения, где форма
входа показывает понятный текст.

| Код | Когда |
|---|---|
| `oauth_state_mismatch` | Callback пришёл не из того браузера или сеанс истёк |
| `oauth_cancelled` | Пользователь отменил вход у провайдера (нет `code`, есть `error`) |
| `oauth_unavailable` | Ключи провайдера не заданы на сервере |
| `oauth_exchange_failed` | Провайдер не обменял код на токен |
| `oauth_email_unverified` | Провайдер не подтвердил email аккаунта |
| `oauth_email_missing` | Провайдер не передал email (бывает у Facebook) |
| `oauth_account_exists` | Есть аккаунт с этим email, но email не подтверждён |
| `oauth_account_unavailable` | Аккаунт удалён |
| `legal_acceptance_required` | Новый аккаунт без принятых документов |
| `oauth_failed` | Непредвиденная ошибка; пишется в лог API |

Если нужна 2FA, слушатель попадает на `/login/2fa`, артист — на `/login?twoFactor=1`.

Переменные окружения:

```env
OAUTH_GOOGLE_CLIENT_ID=
OAUTH_GOOGLE_CLIENT_SECRET=
OAUTH_FACEBOOK_APP_ID=
OAUTH_FACEBOOK_APP_SECRET=
API_BASE_URL=http://localhost:3000
```

## Двухфакторная аутентификация (2FA)

Реализована через TOTP (RFC 6238) — совместима с Google Authenticator, Authy и др.

**Включение:**

```http
POST /api/v1/users/auth/2fa/enable
```

Ответ содержит QR-код (base64 PNG) и `otpauth://` URI для ручного ввода.

**Верификация:**

```http
POST /api/v1/users/auth/2fa/verify
Content-Type: application/json

{ "code": "123456" }
```

При входе с включённой 2FA сервер возвращает `requiresTwoFactor: true` — клиент должен запросить TOTP-код и отправить его повторно.

**Отключение:**

```http
POST /api/v1/users/auth/2fa/disable
Content-Type: application/json

{ "code": "123456" }
```

## Сброс пароля

```http
# 1. Запрос письма
POST /api/v1/users/auth/password/forgot
Content-Type: application/json

{ "email": "john@example.com" }
```

Если SMTP не настроен, токен логируется в консоль (dev-режим).

```http
# 2. Сброс по токену из письма
POST /api/v1/users/auth/password/reset
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "password": "NewSecurePass123"
}
```

## Использование в NestJS контроллерах

```typescript
// Только для пользователей
@UserAuth()
@Get('me')
getMe(@Req() req: UserAuthRequest) {
  return req.user // UserEntity
}

// Только для артистов
@ArtistAuth()
@Post('tracks')
uploadTrack(@Req() req: ArtistAuthRequest) {
  return req.artist // ArtistEntity
}
```
