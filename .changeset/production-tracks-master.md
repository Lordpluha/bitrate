---
'@bitrate/api': patch
---

Production pulls the `:master` images rather than `:develop`.

The compose file named the `develop` tag, so the server would have deployed whatever last landed on
the working branch. It follows `master` now, which is what the branch protection and the existing
pull-request flow already treat as the released state.

The server's checkout has to be on `master` too, not only its images: the nginx templates, the
compose file, and the Taskfile are read from the working tree rather than from any image, so a
checkout left on `develop` deploys images built from one commit alongside configuration from
another.
