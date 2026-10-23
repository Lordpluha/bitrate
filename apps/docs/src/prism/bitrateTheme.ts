import type { PrismTheme } from 'prism-react-renderer'

/**
 * One Prism theme for every colour mode: each colour is a `--bitrate-code-*` variable that
 * custom.css sets per theme, so light, dark and dim recolour code blocks without a second theme.
 */
export const bitrateTheme: PrismTheme = {
  plain: {
    color: 'var(--bitrate-code-plain)',
    backgroundColor: 'var(--bitrate-code-bg)',
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: { color: 'var(--bitrate-code-comment)', fontStyle: 'italic' },
    },
    {
      types: ['keyword', 'operator', 'tag', 'important', 'atrule', 'selector'],
      style: { color: 'var(--bitrate-code-keyword)' },
    },
    {
      types: ['string', 'char', 'attr-value', 'regex', 'inserted', 'url'],
      style: { color: 'var(--bitrate-code-string)' },
    },
    {
      types: ['number', 'boolean', 'constant', 'symbol'],
      style: { color: 'var(--bitrate-code-number)' },
    },
    {
      types: ['function', 'class-name', 'builtin', 'attr-name', 'property'],
      style: { color: 'var(--bitrate-code-function)' },
    },
    {
      types: ['punctuation', 'variable'],
      style: { color: 'var(--bitrate-code-plain)' },
    },
    {
      types: ['deleted'],
      style: { color: 'var(--bitrate-code-deleted)' },
    },
  ],
}
