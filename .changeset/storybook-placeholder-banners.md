---
'@spotify/ui-react': patch
---

Added the four placeholder banner images the avatar, carousel, and empty stories have
imported since they were written. The files were never committed, so `storybook build`
failed on eleven unresolved imports and the Storybook could not be built at all.
