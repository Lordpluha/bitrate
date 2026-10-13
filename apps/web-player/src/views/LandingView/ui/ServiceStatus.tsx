'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useServiceStatus } from '../api/useServiceStatus'
import type { LandingKey } from '../model/messages/en'
import type { ServiceState } from '../model/serviceStatus'
import { useLandingCopy } from '../model/useLandingCopy'

const PILL: Record<ServiceState, LandingKey> = {
  checking: 'status.checking',
  operational: 'status.operational',
  degraded: 'status.degraded',
  unreachable: 'status.unreachable',
}
const ROW: Record<ServiceState, LandingKey> = {
  checking: 'status.state_checking',
  operational: 'status.state_operational',
  degraded: 'status.state_degraded',
  unreachable: 'status.state_unreachable',
}
/* the gooey blob grows out of the pill; a click right after a hover-open keeps it open */
const HOVER_GRACE_MS = 600
const PANEL_OFFSET = 46

/** Footer status: a pill that blooms into a panel with the platform's real readiness. */
export const ServiceStatus = () => {
  const c = useLandingCopy()
  const { state, checkedAt } = useServiceStatus()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLSpanElement>(null)
  const panel = useRef<HTMLSpanElement>(null)
  const blob = useRef<HTMLSpanElement>(null)
  const goo = useRef<HTMLSpanElement>(null)
  const hoverAt = useRef(0)

  const fitPanel = useCallback(() => {
    const h = panel.current?.offsetHeight ?? 0
    if (blob.current) blob.current.style.height = `${h}px`
    if (goo.current) goo.current.style.height = `${h + PANEL_OFFSET + 40}px`
  }, [])

  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const d = (s: number) => (reduce ? 0.01 : s)
    const b = blob.current
    const p = panel.current
    if (!b || !p) return
    root.current?.closest('.landing')?.classList.toggle('is-health-open', open)
    let cancelled = false
    /* gsap stays out of the first-load bundle: it arrives with the first interaction */
    void import('gsap').then(({ gsap }) => {
      if (cancelled) return
      gsap.killTweensOf([b, p])
      if (open) {
        fitPanel()
        gsap.to(b, {
          scaleX: 1,
          scaleY: 1,
          duration: d(0.75),
          ease: 'elastic.out(1, .72)',
        })
        gsap.fromTo(
          p,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: d(0.35), delay: d(0.18) },
        )
      } else {
        gsap.to(p, { opacity: 0, y: 6, duration: d(0.18) })
        gsap.to(b, {
          scaleX: 0.12,
          scaleY: 0.05,
          duration: d(0.45),
          ease: 'power3.in',
          delay: d(0.05),
        })
      }
    })
    return () => {
      cancelled = true
    }
  }, [open, fitPanel])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onDown = (e: PointerEvent) => {
      if (e.target instanceof Node && !root.current?.contains(e.target))
        setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    window.addEventListener('resize', fitPanel)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
      window.removeEventListener('resize', fitPanel)
    }
  }, [open, fitPanel])

  const checked = checkedAt
    ? c('status.checked', {
        time: new Date(checkedAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      })
    : c('status.never')

  return (
    <span
      className={`health is-${state}${open ? ' open' : ''}`}
      onPointerEnter={(e) => {
        if (e.pointerType !== 'mouse') return
        if (!open) hoverAt.current = performance.now()
        setOpen(true)
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') setOpen(false)
      }}
      ref={root}
    >
      <span aria-hidden="true" className="goo" ref={goo}>
        <span className="blob b-panel" ref={blob} />
        <span className="blob b-pill" />
      </span>
      <span
        aria-label={c('status.label')}
        className="hpanel"
        id="hpanel"
        ref={panel}
        role="dialog"
      >
        <span
          className="row"
          style={{ justifyContent: 'space-between', marginBottom: '6px' }}
        >
          <span>
            <b
              style={{
                font: '600 15px/1.2 var(--font-body)',
                display: 'block',
              }}
            >
              {c('status.label')}
            </b>
            <small className="t-meta">{checked}</small>
          </span>
        </span>
        <span className="hrow is-single">
          <span>
            <b>{c('status.row')}</b>
            <small>{c('status.scope')}</small>
          </span>
          <span className={`hstate is-${state}`}>{c(ROW[state])}</span>
        </span>
      </span>
      <button
        aria-controls="hpanel"
        aria-expanded={open}
        aria-label={c('status.toggle')}
        className="hpill"
        id="hpill"
        onClick={() =>
          setOpen((v) =>
            performance.now() - hoverAt.current < HOVER_GRACE_MS ? true : !v,
          )
        }
        type="button"
      >
        <i className={`hdot is-${state}`} />
        <span>{c(PILL[state])}</span>
        <svg
          aria-hidden="true"
          className="i"
          style={{ width: '14px', height: '14px', color: 'var(--muted)' }}
        >
          <use href="#i-arrow" />
        </svg>
      </button>
    </span>
  )
}
