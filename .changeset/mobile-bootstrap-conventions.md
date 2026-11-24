---
'@bitrate/mobile': minor
---

The mobile app replaced the Expo starter screens with its own foundations: a typed API client
on `@bitrate/contracts` that refreshes the cookie session on a 401, TanStack Query and Zustand
for state, a generated bridge from the shared design tokens (Dark, Light and Neutral themes),
English, Ukrainian and Polish translations, and Jest unit tests that also run in CI. Its first
screen checks the connection to the Bitrate API.
