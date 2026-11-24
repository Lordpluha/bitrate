/** Custom properties declared by one CSS block, keyed by name without the leading `--`. */
export type CssBlock = {
  selector: string
  vars: Record<string, string>
}

const COMMENT = /\/\*[\s\S]*?\*\//g
const BLOCK = /([^{}]+)\{([^{}]*)\}/g
const DECLARATION = /--([\w-]+)\s*:\s*([^;]+);/g

/**
 * Reads the flat `selector { --name: value; }` blocks of a token stylesheet. Nested at-rules are
 * not expected in the token files; `@import` and `@custom-variant` lines carry no braces and are
 * skipped by the block pattern.
 */
export function readCssBlocks(css: string): CssBlock[] {
  const source = css.replace(COMMENT, '')
  const blocks: CssBlock[] = []

  for (const [, rawSelector, body] of source.matchAll(BLOCK)) {
    const vars: Record<string, string> = {}
    for (const [, name, value] of body.matchAll(DECLARATION)) {
      vars[name] = value.replace(/\s+/g, ' ').trim()
    }
    const selector = rawSelector.split(';').pop()?.trim() ?? ''
    blocks.push({ selector, vars })
  }

  return blocks
}
