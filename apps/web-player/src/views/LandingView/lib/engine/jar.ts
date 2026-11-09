import type { PhysicsBall } from './physics'

/** The jar inside the team pit, in pit pixels; `top` is the rim (the opening). */
export type JarBox = {
  left: number
  right: number
  top: number
  bottom: number
  /** Ball radii scale with the jar so a phone-sized pit still holds the whole team. */
  scale: number
}

/** The jar's size on the 1440×900 board; smaller pits shrink it (and the balls) proportionally. */
const JAR = { width: 520, height: 600, floorGap: 16 } as const
const MIN_SCALE = 0.42
/** Share of the wall speed kept after a bounce. */
const WALL_BOUNCE = 0.4
const FLOOR_BOUNCE = 0.32
const FLOOR_FRICTION = 0.94
/** A shaken wall hands a bubble a bit more than its own speed, as glass flicks a ball. */
const WALL_PUSH = 1.25
const STILL = { x: 0, y: 0 } as const

/** Where the jar sits in a pit of this size: centred, standing on the pit floor. */
export const jarBox = ({ w, h }: { w: number; h: number }): JarBox => {
  const scale = Math.max(
    MIN_SCALE,
    Math.min(1, w / (JAR.width * 1.35), h / (JAR.height * 1.2)),
  )
  const width = JAR.width * scale
  const height = JAR.height * scale
  const left = (w - width) / 2
  const bottom = h - JAR.floorGap
  return { left, right: left + width, top: bottom - height, bottom, scale }
}

/**
 * Keeps a ball inside the jar's walls and floor. With the lid on, the rim is a ceiling; once the
 * lid is off a ball may rise past the rim (and is then out, see {@link hasLeftJar}).
 */
export const containInJar = ({
  ball,
  jar,
  open,
  wall = STILL,
}: {
  ball: PhysicsBall
  jar: JarBox
  open: boolean
  /** How fast the jar itself is moving (a hand shaking it), in jar pixels per second. */
  wall?: { x: number; y: number }
}) => {
  const { p, v, r } = ball
  /* above the rim of an open jar there are no walls: the ball is on its way out */
  if (open && p.y < jar.top) return
  /* a wall moving into a bubble throws it a little faster than the wall itself */
  if (p.x < jar.left + r) {
    p.x = jar.left + r
    v.x = Math.max(Math.abs(v.x) * WALL_BOUNCE, wall.x * WALL_PUSH)
  }
  if (p.x > jar.right - r) {
    p.x = jar.right - r
    v.x = Math.min(-Math.abs(v.x) * WALL_BOUNCE, wall.x * WALL_PUSH)
  }
  if (p.y > jar.bottom - r) {
    p.y = jar.bottom - r
    v.y = Math.min(-Math.abs(v.y) * FLOOR_BOUNCE, wall.y * WALL_PUSH)
    v.x *= FLOOR_FRICTION
  }
  if (!open && p.y < jar.top + r) {
    p.y = jar.top + r
    v.y = Math.max(Math.abs(v.y) * WALL_BOUNCE, wall.y * WALL_PUSH)
  }
}

/** A ball wholly above the rim has left the jar. */
export const hasLeftJar = ({ ball, jar }: { ball: PhysicsBall; jar: JarBox }) =>
  ball.p.y + ball.r < jar.top

/**
 * Keeps a loose ball inside the landing: the screen's sides are walls and, in the footer scene,
 * the footer is the floor. Without a floor the ball falls on; returns `true` once it is below
 * the screen, i.e. on its way down to the footer.
 */
export const containLoose = ({
  ball,
  width,
  height,
  floor,
}: {
  ball: PhysicsBall
  width: number
  height: number
  /** Viewport y of the footer's top edge, or `null` in every other scene. */
  floor: number | null
}) => {
  const { p, v, r } = ball
  if (p.x < r) {
    p.x = r
    v.x = Math.abs(v.x) * WALL_BOUNCE
  }
  if (p.x > width - r) {
    p.x = width - r
    v.x = -Math.abs(v.x) * WALL_BOUNCE
  }
  if (floor === null) return p.y - r > height
  if (p.y > floor - r) {
    p.y = floor - r
    v.y = -Math.abs(v.y) * FLOOR_BOUNCE
    v.x *= FLOOR_FRICTION
  }
  return false
}
