---
'@bitrate/web-player': patch
---

Fixed the sign-in and registration forms rejecting an autofilled address with a stray space as "Invalid email address"; the address is now trimmed and lower-cased before it is checked and sent.
