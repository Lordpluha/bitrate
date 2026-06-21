/** The html escape value. */
const HTML_ESCAPE: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** The escape html value. */
export const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => HTML_ESCAPE[c]!)
