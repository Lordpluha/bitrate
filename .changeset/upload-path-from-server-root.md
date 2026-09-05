---
'@bitrate/api': patch
---

An upload's path is built from the directory the server chose, not from the one the request
carried.

Every field on a Multer file object arrives with the request, `path` included — Multer writes the
file, but the object describing it is request data. The cleanup and validation paths were derived
from `dirname(file.path)`, so a value shaped by the request reached `open()` and `rm()` even though
the filename itself was a generated UUID.

Both halves are now server-owned: the directory is a named constant the upload interceptor also
writes to, and the filename is the result of `basename()`. The destination literals moved next to
the media helpers so the interceptor and the cleanup cannot drift apart.

An existing spec asserted the avatar cleanup deleted `/tmp/avatar.png` — the path its fixture put on
the file object. It now asserts the file under the avatar directory, which is what the code should
always have removed.
