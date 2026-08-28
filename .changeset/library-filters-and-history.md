---
'@spotify/web-player': minor
---

Listening history is now recorded. A track played for more than fifteen seconds
is written to the history, which had never happened — the mutation existed but
nothing called it, leaving the history table empty for every user and "Top
artists this month", "Top tracks this month" and Recents permanently blank.

The library sidebar filter chips now actually filter. They previously kept their
selection in local state that nothing consumed, and an active chip painted white
text on a white background. Followed artists and saved episodes join playlists
in the list, each linking to its own screen. The "Albums" chip was removed
because no per-user saved-album endpoint exists behind it.

The profile gained a "Following artists" section, so artists you follow are
visible somewhere, and its sections are evenly spaced instead of colliding.

The avatar picker accepts a dropped image and no longer shows the browser's
own locale-specific "no file chosen" label, which contradicted the language
selected in the app.
