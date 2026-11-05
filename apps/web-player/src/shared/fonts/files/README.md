# Local web-player fonts

The brand fonts use the original Google Fonts WOFF2 subsets and face declarations in
`../brandFonts.css`. Keeping them in the repository removes build-time Google Fonts requests
([Next.js #99114](https://github.com/vercel/next.js/issues/99114)) while preserving the existing
rendering, Unicode coverage, weight faces and fallback metrics. Browsers fetch only the subsets
needed by the page. Kanit continues to use `next/font/local` in the root layout.

| Files | Google Fonts version | Weights |
| --- | --- | --- |
| inter-*.woff2 | Inter v20 | 400, 500, 600, 700 |
| unbounded-*.woff2 | Unbounded v12 | 500, 600, 700, 800 |
| jetbrains-mono-*.woff2 | JetBrains Mono v24 | 500 |
| Kanit-*.woff2 | Kanit 2.000 | 300, 400, 500, 600, 700 |

The brand subsets are the unmodified files previously emitted by `next/font/google` for these
Google Fonts CSS requests, using Next.js's Chrome User-Agent:

- `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap`
- `https://fonts.googleapis.com/css2?family=Unbounded:wght@500;600;700;800&display=swap`
- `https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500&display=swap`

Kanit sources are `ofl/kanit/Kanit-{Light,Regular,Medium,SemiBold,Bold}.ttf` from
[`google/fonts` at eb20e9cf19d97cf579fa3867d729d4222d6c59e1](https://github.com/google/fonts/tree/eb20e9cf19d97cf579fa3867d729d4222d6c59e1/ofl).
They were compressed without subsetting using FontTools 4.60.1 and Brotli 1.1.0:

```python
from pathlib import Path
from fontTools.ttLib import TTFont

for path in Path('.').glob('Kanit-*.ttf'):
    font = TTFont(path)
    font.flavor = 'woff2'
    font.save(path.with_suffix('.woff2'))
```

Each family includes its original SIL Open Font License in `OFL-<family>.txt`.
When updating fonts, retain the declared subsets and weights and run the screenshot suite;
do not regenerate its baselines to hide a typography change.
