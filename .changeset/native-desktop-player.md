---
'@bitrate/desktop': minor
'@bitrate/web-player': patch
---

Added the native Bitrate desktop app: the web player's screens, shell and player in a Tauri window, signed in through a loopback proxy to the API and closed to signed-out visitors, who are sent to the login screen, with a tray icon (show, play/pause, next, previous, quit), hide-to-tray on close, a single running instance, a remembered window size and position, external links opening in the system browser, and `bitrate://` links to albums, artists, playlists, profiles, search and library screens. The web player's query client setup moved into its shared API layer so both apps use it, and the player header's Log in and Sign up now open the designed full-screen auth pages instead of the old, unstyled sign-in and sign-up dialogs, which were removed.
