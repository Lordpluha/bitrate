---
"@bitrate/api": minor
---

Add a standalone transcode worker entrypoint (`dist/src/main.worker.js`, `pnpm --filter @bitrate/api start:worker`). It runs only the audio-conversion consumer in a Nest application context with no HTTP listener, forces `AUDIO_PROCESSING_WORKER_ENABLED=true`, drains active jobs on SIGTERM, and refuses to start with `NODE_ENV=production` and `STORAGE_DRIVER=local`. The consumer, attempt recorder and both queue registrations move into a shared `TranscodeModule`. The API process is unchanged until `AUDIO_PROCESSING_WORKER_ENABLED=false` is set on it.
