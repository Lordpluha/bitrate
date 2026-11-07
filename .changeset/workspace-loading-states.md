---
"@bitrate/web-artists": minor
---

Show responsive skeletons while workspace pages load. Add an indeterminate top progress bar
for route navigation and active queries awaiting initial data, with a delay to avoid flashing
on short requests and reduced-motion support.
Render the initial progress indicator in server HTML and use visible, animated shimmer placeholders
so loading remains apparent while client scripts download on slow connections.
