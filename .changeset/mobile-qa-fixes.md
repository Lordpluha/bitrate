---
'@bitrate/mobile': patch
---

The mobile app now opens the login screen for a signed-out listener instead of "This screen
doesn't exist", returns to login right after logging out, opens Profile and Liked Songs (their
routes were unreachable), and records listened tracks after 15 seconds so Recently played, the
Resume tile and the Library history fill up.
