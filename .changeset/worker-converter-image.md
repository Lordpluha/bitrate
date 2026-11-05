---
'@bitrate/api': patch
---

Fixed the transcode worker failing every conversion job in the production image with "Cannot find module '@bitrate/converter'". The image now ships the converter package that the API's pnpm link points to, and the image build fails if that import cannot be resolved.
