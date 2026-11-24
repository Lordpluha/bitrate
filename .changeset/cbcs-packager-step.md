---
'@bitrate/converter': minor
---

Added `encryptCmafRenditions`, which encrypted CMAF renditions with CENC `cbcs` through Shaka
Packager (raw key, no clear lead, W3C Common PSSH) and rebuilt their byte index, optionally
packaging clear copies on the same fragment grid. `packagerPath` resolved the packager binary.
