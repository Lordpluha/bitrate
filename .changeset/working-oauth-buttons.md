---
'@bitrate/api': minor
'@bitrate/web-player': minor
'@bitrate/web-artists': minor
---

Made the Google and Facebook sign-in buttons work end to end. A social sign-in now links the provider to an existing account with the same, already verified email instead of refusing it, and still asks for the 2FA code when the account has it on. Every failure — a cancelled consent screen, a provider that is not configured yet, a missing or unverified email, an unverified existing account — returns the browser to the login page with an error code that both web apps explain in English, Ukrainian and Polish, instead of leaving it on a raw JSON response from the API. The artist portal now keeps the error on its login page and opens the 2FA step there after a social sign-in, where it used to land on a missing `/login/2fa` page.
