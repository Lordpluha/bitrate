---
'@bitrate/svgr': patch
---

The icon generator formats its output without going through a shell.

`execSync` built the Biome command by interpolating the output directory into a string, so the
path was parsed by a shell before reaching the tool. It is `execFileSync` with the directory as its
own argument now — never parsed, so no quoting in a path can change what runs. The directory comes
from workspace configuration rather than a user, which is why this was latent rather than
exploitable, but a build tool that runs on every developer's machine is a poor place to rely on
that distinction holding.
