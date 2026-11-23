/*
 * Inline Markdown patterns shared by the channel formatters. Each repeated class excludes the
 * delimiter that ends it (and `[` for links), so a failed match stops at the next delimiter
 * and a whole pass stays linear (CodeQL js/polynomial-redos).
 */

export const CODE = /`([^`\n]+)`/g

export const BOLD = /\*\*([^*\n]+)\*\*/g

export const ITALIC = /(^|[^\w*])[*_]([^*_\n]+)[*_](?=$|[^\w*])/gm

export const LINK = /\[([^[\]\n]+)\]\(([^()\s]+)\)/g
