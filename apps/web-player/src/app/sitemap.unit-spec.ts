import { describe, expect, it } from 'vitest'
import robots from './robots'
import sitemap from './sitemap'

describe('public crawler metadata', () => {
  it('does not advertise auth routes that robots disallow', () => {
    const urls = sitemap().map(({ url }) => new URL(url).pathname)
    const rules = robots().rules
    const toPaths = (value: string | string[] | undefined) =>
      value === undefined ? [] : Array.isArray(value) ? value : [value]
    const disallowed = Array.isArray(rules)
      ? rules.flatMap((rule) => toPaths(rule.disallow))
      : toPaths(rules?.disallow)

    expect(urls).toEqual(['/'])
    expect(
      urls.some((url) =>
        disallowed.some((path) => url === path || url.startsWith(path)),
      ),
    ).toBe(false)
  })
})
