---
"@bitrate/web-player": patch
---

Adding songs to your own playlist works again. The playlist page used to keep showing the
browser's cached copy for up to 30 seconds after a track was added, so the new song did not
appear, stayed on offer with its Add button and could be added twice; the page now
revalidates the playlist on every refetch. The "find something for your playlist" search
matches artists as well as titles, shows the artist's name instead of an id and no longer
repeats the title in a second column.
