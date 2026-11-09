/** The signal surface shows `mix(shape a, shape b, mix)`; `mix` 1 means it has settled on `b`. */
export type MorphState = { a: number; b: number; mix: number }

/**
 * How to reach `target` without a visible jump:
 * - `reverse`: heading back mid-morph, run the morph backwards to `a`;
 * - `continue`: already on its way to (or settled on) `target`;
 * - `chain`: mid-morph towards another shape, finish it quickly, then morph on;
 * - `start`: settled, morph from `b` to `target`.
 * The old behaviour reset `mix` to 0 at once, which snapped the shape (and its noise burst) on
 * every interrupted change — most visibly when scrolling straight back.
 */
export const planMorph = (
  s: MorphState,
  target: number,
): 'reverse' | 'continue' | 'chain' | 'start' => {
  if (target === s.b) return 'continue'
  if (s.mix < 1 && target === s.a) return 'reverse'
  return s.mix < 1 ? 'chain' : 'start'
}
