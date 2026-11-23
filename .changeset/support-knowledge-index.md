---
'@bitrate/api': minor
---

Added the support assistant's knowledge index (#570). On start the API indexes the bundled help articles and the published legal texts into Qdrant, when `QDRANT_URL` and `OPENAI_API_KEY` are set. It rebuilds a collection only when the sources or the embedding model changed, and swaps the search alias without downtime.
