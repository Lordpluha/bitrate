/* stable ids: a node's id is hashed (FNV-1a) from a key such as its owner's name and its position in
   the tree, so a rebuild without structural changes keeps every id and open designs never point at
   vanished nodes */
const ALPHA = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

/** Returns a generator of six-character ids hashed from a key, unique against `taken` (salted on collision). */
export const stableIds =
  (taken = new Set()) =>
  (key) => {
    for (let salt = 0; ; salt++) {
      let h = 2166136261
      for (const ch of `${key}#${salt}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0
      let out = ''
      for (let i = 0; i < 6; i++) {
        out += ALPHA[h % 62]
        h = Math.imul(h ^ (h >>> 13), 2246822507) >>> 0
      }
      if (!taken.has(out)) {
        taken.add(out)
        return out
      }
    }
  }
