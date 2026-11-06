---
"@bitrate/api": patch
---

Tracks no longer stay in PROCESSING forever. Reprocessing a track or retrying a release now
queued a new conversion even when an earlier failed one was still stored; a conversion that
BullMQ failed for good outside the normal retries (a worker killed mid-job three times) marked
the track FAILED; a sweep every 10 minutes failed tracks left processing with no live
conversion, so their release stopped waiting; and storage calls on the worker got timeouts.
