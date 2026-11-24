---
'@bitrate/player': minor
---

The streaming element played `cbcs`-encrypted CMAF renditions through EME ClearKey (ADR-0077):
manifest renditions gained `encryption`, `fetchRange` received `encrypted`, and a host
`requestLicense` answered the CDM's licence request. Without ClearKey `cbcs` in the browser, without
`requestLicense`, or when a licence was refused, the element played the clear rendition instead.
