/** A position or velocity; the 2D toys keep `z` at 0. */
type Vec = { x: number; y: number; z: number }

/** A ball in the landing's physics toys (partner spheres, partner bubbles, team pit). */
export type PhysicsBall = { r: number; p: Vec; v: Vec }

/** Guards the collision normal when two centres coincide. */
const MIN_DISTANCE = 1e-3

/**
 * One pass of pairwise ball collisions: overlapping balls are pushed apart along their normal
 * (split by inverse mass) and, when approaching, get an impulse of `bounce` × their closing speed.
 * Without `inverseMass` every ball weighs the same.
 */
export const collideBalls = <B extends PhysicsBall>({
  balls,
  dims,
  bounce,
  inverseMass,
}: {
  balls: readonly B[]
  /** 2D toys ignore depth entirely. */
  dims: 2 | 3
  /** Impulse factor, `1 + restitution`. */
  bounce: number
  inverseMass?: (ball: B) => number
}) => {
  for (let i = 0; i < balls.length; i++) {
    const a = balls[i]
    if (!a) continue
    for (let j = i + 1; j < balls.length; j++) {
      const b = balls[j]
      if (!b) continue
      const dx = b.p.x - a.p.x
      const dy = b.p.y - a.p.y
      const dz = b.p.z - a.p.z
      const d =
        (dims === 3 ? Math.hypot(dx, dy, dz) : Math.hypot(dx, dy)) ||
        MIN_DISTANCE
      const min = a.r + b.r
      if (d >= min) continue
      const nx = dx / d
      const ny = dy / d
      const nz = dims === 3 ? dz / d : 0
      const ma = inverseMass?.(a) ?? 1
      const mb = inverseMass?.(b) ?? 1
      const sum = ma + mb || 1
      const corr = min - d
      a.p.x -= nx * corr * (ma / sum)
      a.p.y -= ny * corr * (ma / sum)
      a.p.z -= nz * corr * (ma / sum)
      b.p.x += nx * corr * (mb / sum)
      b.p.y += ny * corr * (mb / sum)
      b.p.z += nz * corr * (mb / sum)
      const rv =
        (b.v.x - a.v.x) * nx + (b.v.y - a.v.y) * ny + (b.v.z - a.v.z) * nz
      if (rv < 0) {
        const imp = (-rv * bounce) / sum
        a.v.x -= nx * imp * ma
        a.v.y -= ny * imp * ma
        a.v.z -= nz * imp * ma
        b.v.x += nx * imp * mb
        b.v.y += ny * imp * mb
        b.v.z += nz * imp * mb
      }
    }
  }
}
