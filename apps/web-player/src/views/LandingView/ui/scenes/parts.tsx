import type { HTMLAttributes, ReactNode } from 'react'
import { lc } from '../../lib/styles/lc'
import type { LandingKey } from '../../model/messages/en'
import type { SceneId } from '../../model/scenes'
import { useLandingCopy } from '../../model/useLandingCopy'

type SceneShellProps = {
  id: SceneId
  /** Accessible name of the scene. */
  labelKey: LandingKey
  /** The scene shown before the engine starts (the first one). */
  active?: boolean
  children: ReactNode
}

/** A fullscreen scene: its labelled section and the 1440x900 board the engine scales. */
export const SceneShell = ({
  id,
  labelKey,
  active = false,
  children,
}: SceneShellProps) => {
  const c = useLandingCopy()
  return (
    <section
      aria-label={c(labelKey)}
      className={lc(active ? 'scene is-active' : 'scene')}
      id={id}
    >
      <div className={lc('board')}>{children}</div>
    </section>
  )
}

type AbsProps = Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style'> & {
  /** Position and size on the board, in board pixels. */
  x: number
  y: number
  w: number
  h?: number
  /** Marker classes besides `abs`. */
  markers?: string
  /** The element's own utilities. */
  extra?: string
  /** Entrance the engine plays for it. */
  'data-a'?: 'up' | 'win'
}

/** A box placed absolutely on the board. */
export const Abs = ({
  x,
  y,
  w,
  h,
  markers,
  extra,
  children,
  ...rest
}: AbsProps) => (
  <div
    className={lc(markers ? `abs ${markers}` : 'abs', extra)}
    {...rest}
    style={{ '--x': x, '--y': y, '--w': w, '--h': h }}
  >
    {children}
  </div>
)

type TrackRowProps = {
  /** Cover art variant, `cv1`…`cv6`. */
  cover: string
  title: string
  artist: string
  /** Trailing content: duration, like, … */
  children?: ReactNode
}

/** A compact queue/list row: cover, title and artist. */
export const TrackRow = ({ cover, title, artist, children }: TrackRowProps) => (
  <div className={lc('qrow')}>
    <span className={lc(`cv s ${cover}`)}></span>
    <div className={lc('grow')}>
      <p className={lc('t-title')}>{title}</p>
      <p className={lc('t-meta')}>{artist}</p>
    </div>
    {children}
  </div>
)

type SceneFootnoteProps = {
  x: number
  y: number
  w: number
  /** The scene's demo disclaimer. */
  noteKey: LandingKey
  /** The signature leads; otherwise the note does. */
  signFirst?: boolean
}

/** The board's bottom line: the "music lives on" signature and the scene's demo note (desktop only). */
export const SceneFootnote = ({
  x,
  y,
  w,
  noteKey,
  signFirst = true,
}: SceneFootnoteProps) => {
  const c = useLandingCopy()
  const sign = <span className={lc('sig')}>{c('common.music_lives_on')}</span>
  const note = <span className={lc('disc')}>{c(noteKey)}</span>
  return (
    <Abs extra="justify-between" markers="row d-only" w={w} x={x} y={y}>
      {signFirst ? sign : note}
      {signFirst ? note : sign}
    </Abs>
  )
}
