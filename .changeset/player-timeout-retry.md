---
'@spotify/web-player': patch
---

A stalled audio fragment request no longer ends playback in silence. The
per-attempt timeout aborted its own `AbortController`, and the retry backoff
then waited on that same already-aborted signal — so it resolved immediately and
the request returned "superseded" on the first attempt. The buffer filler reads
that as a benign cancellation, so it stopped without reporting an error, the
250 ms refill tick restarted it forever, and neither the error toast nor the
CMAF-to-HLS fallback ever fired. The configured retry budget was dead for every
timeout. Backoff now waits on a plain delay and checks currency afterwards, and
an exhausted request throws so the caller can surface it.

Recovering from a full media buffer also works in the first 30 seconds of a
track: the quota handler previously only trimmed behind the playhead, which
frees nothing that early, so the track dropped out of Media Source Extensions
entirely. It now falls back to evicting buffered media ahead of the playhead,
keeping a safety margin around the current position.

Skipping backwards from the first track no longer wraps to the end of the queue
when repeat is off, matching how skipping forward from the last track behaves.
