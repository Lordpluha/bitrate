---
'@bitrate/api': patch
---

Fixed artists being told "Invalid credentials" right after registering when the sign-in form sent their address with a capital letter or a stray space (autofill, mobile keyboards). Artist sign-in, registration and password reset now trim and lower-case the address, and account lookups ignore letter case, so older accounts stored in mixed case are found too.
