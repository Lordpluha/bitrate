import { motionReduced } from './motion'

const PIECES = 140
const GRAVITY = 0.16
/** Theme roles the pieces are coloured with, read at burst time so every theme fits. */
const COLOR_ROLES = [
  '--color-artist-selection-border',
  '--color-artist-icon',
  '--color-gradient-brand-to',
  '--color-gradient-primary-to',
  '--color-artist-status-ready',
]

interface Piece {
  x: number
  y: number
  vx: number
  vy: number
  turn: number
  spin: number
  size: number
  color: string
  life: number
}

/**
 * A short burst of confetti from the top centre of the viewport on a throwaway canvas, which
 * removes itself when the last piece has fallen. Does nothing under reduced motion.
 */
export function burstConfetti() {
  if (motionReduced()) return
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) return
  const ratio = window.devicePixelRatio || 1
  const width = window.innerWidth
  const height = window.innerHeight
  canvas.width = width * ratio
  canvas.height = height * ratio
  canvas.setAttribute('aria-hidden', 'true')
  canvas.className = 'artist-confetti'
  document.body.append(canvas)
  context.scale(ratio, ratio)
  const style = getComputedStyle(document.documentElement)
  const colors = COLOR_ROLES.map((role) =>
    style.getPropertyValue(role).trim(),
  ).filter(Boolean)
  let pieces: Piece[] = Array.from({ length: PIECES }, () => ({
    x: width / 2 + (Math.random() - 0.5) * width * 0.2,
    y: height * 0.18,
    vx: (Math.random() - 0.5) * 14,
    vy: -Math.random() * 9 - 3,
    turn: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.3,
    size: 5 + Math.random() * 5,
    color: colors[Math.floor(Math.random() * colors.length)] ?? 'currentColor',
    life: 1,
  }))
  const frame = () => {
    context.clearRect(0, 0, width, height)
    for (const piece of pieces) {
      piece.vy += GRAVITY
      piece.vx *= 0.99
      piece.x += piece.vx
      piece.y += piece.vy
      piece.turn += piece.spin
      piece.life -= 0.006
      context.save()
      context.globalAlpha = Math.max(0, piece.life)
      context.translate(piece.x, piece.y)
      context.rotate(piece.turn)
      context.fillStyle = piece.color
      context.fillRect(
        -piece.size / 2,
        -piece.size / 4,
        piece.size,
        piece.size / 2,
      )
      context.restore()
    }
    pieces = pieces.filter((piece) => piece.life > 0 && piece.y < height + 20)
    if (pieces.length > 0) requestAnimationFrame(frame)
    else canvas.remove()
  }
  requestAnimationFrame(frame)
}
