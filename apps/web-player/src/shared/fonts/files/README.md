# Local web-player fonts

These fonts are served through `next/font/local`. Keeping them in the repository makes dev
servers and production builds independent of Google Fonts availability and URL response shapes
(see [Next.js #99114](https://github.com/vercel/next.js/issues/99114)).

Source: [`google/fonts` at eb20e9cf19d97cf579fa3867d729d4222d6c59e1](https://github.com/google/fonts/tree/eb20e9cf19d97cf579fa3867d729d4222d6c59e1/ofl).
Each family includes its original SIL Open Font License in `OFL-<family>.txt`.

| Output | Source under `ofl/` | Axes |
| --- | --- | --- |
| Inter.woff2 | inter/Inter[opsz,wght].ttf | Optical size fixed at 14, matching the Google Fonts default; weight remains variable |
| JetBrainsMono.woff2 | jetbrainsmono/JetBrainsMono[wght].ttf | Weight fixed at the existing 500 |
| Unbounded.woff2 | unbounded/Unbounded[wght].ttf | Weight remains variable |
| Kanit-*.woff2 | kanit/Kanit-{Light,Regular,Medium,SemiBold,Bold}.ttf | Original static weights 300–700 |

Converted using FontTools 4.60.1 and Brotli 1.1.0, preserving all character coverage. To
regenerate, download the source TTF files from the pinned revision and run this Python snippet
in their directory with those tools installed:

```python
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

for path in sorted(Path('.').glob('*.ttf')):
    font = TTFont(path)
    if path.stem == 'Inter':
        font = instantiateVariableFont(font, {'opsz': 14}, inplace=True)
    elif path.stem == 'JetBrainsMono':
        font = instantiateVariableFont(font, {'wght': 500}, inplace=True)
    font.flavor = 'woff2'
    font.save(path.with_suffix('.woff2'))
```
