---
id: README
title: Help articles (support knowledge base)
draft: true
---

These articles are the knowledge base of the support assistant
([ADR-0074](../architecture/0074-support-assistant-core-and-channels.md), specification
[#567](https://github.com/Lordpluha/bitrate/issues/567)). The ingest job splits them into
chunks and indexes them in Qdrant
([ADR-0075](../architecture/0075-qdrant-for-support-knowledge.md)). The assistant answers
only from what is written here and from the allowlisted published legal texts.

`draft: true` keeps them out of the docs site's production build, like the legal sources.
They are not developer documentation.

## Layout

```
help/<audience>/<locale>/<slug>.md
```

- `audience`: `listener` (web-player), `artist` (web-artists) or `all` (both).
- `locale`: `en`, `uk` or `pl`. Every article exists in all three locales under the same
  slug, with the same facts.

## Front matter

| Field | Required | Meaning |
|---|---|---|
| `id` | yes | The slug, equal to the file name |
| `title` | yes | Shown as the citation title in answers |
| `draft` | yes | Always `true` |
| `audience` | yes | Must match the folder |
| `locale` | yes | Must match the folder |
| `sources` | no | Public URLs the facts come from; the assistant links them as citations |

## Writing rules

- **State only what the product does today.** Write nothing about planned features
  (PRODUCT.md, principle 5). If a fact comes from a policy, list the policy's public URL
  in `sources` and change the article together with the policy.
- **Never use draft legal text.** A text with unfilled `[[placeholders]]` is not a
  source.
- **Keep the three locales in step.** A fact changed in one locale is changed in all
  three in the same commit.
- **One question per article.** Short paragraphs and lists split into clean chunks.
