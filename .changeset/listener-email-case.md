---
'@bitrate/api': patch
---

Fixed listeners and staff being answered "Invalid email format" or "Invalid credentials" when the sign-in form sent their address with a capital letter or a stray space (autofill, mobile keyboards) — the artist-only fix now covers every audience. Listener sign-in, registration, password reset and verification resend, artist verification codes, staff sign-in and staff creation trim and lower-case the address; account lookups (including OAuth linking) ignore letter case, so accounts stored in mixed case are still found. A malformed address is now answered with the translated "Enter a valid email address".
