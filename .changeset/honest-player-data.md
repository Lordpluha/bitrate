---
'@bitrate/web-player': minor
'@bitrate/contracts': minor
---

The web player no longer shows invented content or controls that do nothing. Search suggestions, browse categories, genre charts, popular artists, an artist's top tracks and "Featuring" playlists come from the API; "This Is" / "Radio" cards, the Download / Invite / Mix buttons, the video settings, volume normalization and the equalizer were removed. Playlist and album likes, Liked Songs counts and the Library Albums tab read the server, so they follow the account to a new browser. The header gained a friend-activity panel, notifications that open the follower or artist, an install button driven by the browser's own prompt, and Bitrate Connect: this browser registers as a device, saves its queue and position, and an empty player continues the saved queue after sign-in (playback is not handed off). Privacy toggles, language and streaming quality are saved to the account, and the Low/Normal qualities cap the stream at 128/192 kbps. Footers link only the published legal documents. The contracts package gained the new endpoints.
