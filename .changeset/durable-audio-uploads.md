---
'@bitrate/api': patch
---

Uploaded audio, HLS artifacts, covers and avatars now survive a production deploy. The API writes them under its working directory, which in the production image is `/app`, and `/app/storage` was mounted nowhere — the bytes lived in the container's writable layer and were destroyed by every `docker compose up -d` that recreated the container. The two mounts the production compose file declared, `../apps/api/uploads` and `../apps/api/public`, pointed at paths nothing in the API has ever written to. The image now creates `/app/storage` so a named volume mounted over it inherits the non-root user's ownership without a chown on the host, and the production stack mounts that volume. Existing uploads are only recoverable from the running container and must be rescued with `task prod:storage:rescue` before the deploy that lands this; see ADR-0033.
