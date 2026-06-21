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
# 1. Редирект на провайдера
GET /api/v1/users/auth/oauth/google

# 2. Провайдер редиректит обратно
GET /api/v1/users/auth/oauth/google/callback?code=...

# 3. API устанавливает cookies и редиректит на WEB_HOST
```

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
