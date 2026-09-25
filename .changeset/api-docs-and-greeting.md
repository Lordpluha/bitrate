---
'@bitrate/api': patch
---

Fixed the root welcome endpoint answering "Welcome to undefined!" in production by greeting
with the API's own name instead of an npm-injected variable that only exists when the process
is started through a script runner, renamed the health/metrics/debug controller's Swagger tag
from the misleading "Welcome" to "System", and enabled the Swagger UI's tag filter plus a
deterministic sort order so operators can navigate the growing route list.
