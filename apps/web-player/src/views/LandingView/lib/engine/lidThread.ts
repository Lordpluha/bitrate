/** The jar lid's thread: how far it turns before it comes off and how stiff the seal is. */
export const LID = {
  /** Turns of thread between screwed tight and off (a real jar is about one and a half). */
  offTurns: 1.5,
  /** The first bit of a turn breaks the seal and takes more force. */
  seal: 0.08,
  /** Share of the drag that turns the lid while the seal holds. */
  sealGrip: 0.35,
} as const

/**
 * Turns the lid by a sideways drag of `dx` pixels at its front edge (right loosens, as the near
 * edge of a lid turned anticlockwise from above moves right). `span` is the drag that makes one
 * full turn. Stops at screwed tight and at the end of the thread.
 */
export const turnLid = ({
  turns,
  dx,
  span,
}: {
  turns: number
  dx: number
  span: number
}) => {
  let d = dx / span
  if (d > 0 && turns < LID.seal) {
    /* stiff until the seal breaks, then it runs freely */
    const stiff = Math.min(d * LID.sealGrip, LID.seal - turns)
    d = stiff + Math.max(0, d - stiff / LID.sealGrip)
  }
  return Math.max(0, Math.min(LID.offTurns, turns + d))
}
