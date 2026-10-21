'use client'

import { type FormEvent, useEffect, useRef, useState } from 'react'
import { lc } from '../lib/styles/lc'
import type { LandingKey } from '../model/messages/en'
import { useLandingCopy } from '../model/useLandingCopy'
import { AssistantOrb, type OrbState } from './AssistantOrb'

type Message = { id: number; me: boolean; text: string }
/** Answers being streamed: the words shown so far, by message id. */
type Streaming = Readonly<Record<number, string>>

/** Demo questions with prepared answers; anything else gets the default demo reply. */
const PRESETS: readonly { q: LandingKey; a: LandingKey }[] = [
  { q: 'assistant.q1', a: 'assistant.a_what' },
  { q: 'assistant.q2', a: 'assistant.a_jam' },
  { q: 'assistant.q3', a: 'assistant.a_free' },
]
const SEARCH_MS = 900
const ANSWER_MS = 1650
const WORD_MS = 45

/** The landing assistant (demo): canned answers from the catalog, streamed word by word. */
export const AssistantPanel = () => {
  const c = useLandingCopy()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [streaming, setStreaming] = useState<Streaming>({})
  const [phase, setPhase] = useState<'idle' | OrbState>('idle')
  const [draft, setDraft] = useState('')
  const panel = useRef<HTMLElement>(null)
  const fab = useRef<HTMLButtonElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLDivElement>(null)
  /** Pending timeouts and stream intervals, cleared on unmount; each removes itself when done. */
  const timers = useRef(new Set<number>())
  const nextId = useRef(0)

  useEffect(
    () => () => {
      for (const t of timers.current) window.clearTimeout(t)
    },
    [],
  )

  useEffect(() => {
    const el = panel.current
    if (!el) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let cancelled = false
    void import('gsap').then(({ gsap }) => {
      if (cancelled) return
      gsap.killTweensOf(el)
      if (open) {
        el.classList.add('open')
        gsap.fromTo(
          el,
          { scale: 0.2, opacity: 0, borderRadius: 40 },
          {
            scale: 1,
            opacity: 1,
            borderRadius: 18,
            duration: reduce ? 0.01 : 0.55,
            ease: 'elastic.out(1, .8)',
          },
        )
        const focus = window.setTimeout(() => {
          timers.current.delete(focus)
          input.current?.focus()
        }, 120)
        timers.current.add(focus)
      } else
        gsap.to(el, {
          scale: 0.2,
          opacity: 0,
          duration: reduce ? 0.01 : 0.25,
          ease: 'power3.in',
          onComplete: () => el.classList.remove('open'),
        })
    })
    return () => {
      cancelled = true
    }
  }, [open])

  /* keep the newest message in view: scroll only when the list content actually changes */
  useEffect(() => {
    const el = list.current
    if (!el) return
    const toBottom = () => {
      el.scrollTop = el.scrollHeight
    }
    const watch = new MutationObserver(toBottom)
    watch.observe(el, { childList: true, subtree: true, characterData: true })
    return () => watch.disconnect()
  }, [])

  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id)
      fn()
    }, ms)
    timers.current.add(id)
  }
  const push = (m: Omit<Message, 'id'>) => {
    const id = nextId.current++
    setMessages((all) => [...all, { ...m, id }])
    return id
  }

  const ask = (q: string) => {
    const question = q.trim()
    if (!question || phase !== 'idle') return
    push({ me: true, text: question })
    setPhase('searching')
    later(() => setPhase('composing'), SEARCH_MS)
    later(() => {
      setPhase('idle')
      const preset = PRESETS.find(
        (p) => c(p.q).toLowerCase() === question.toLowerCase(),
      )
      const text = c(preset?.a ?? 'assistant.a_default')
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduce) {
        push({ me: false, text })
        return
      }
      /* stream word by word into its own state; the list gets the answer once, when it is complete */
      const words = text.split(' ')
      const id = push({ me: false, text: '' })
      let shown = 1
      const show = () =>
        setStreaming((all) => ({
          ...all,
          [id]: words.slice(0, shown).join(' '),
        }))
      show()
      const tick = window.setInterval(() => {
        shown += 1
        if (shown < words.length) {
          show()
          return
        }
        window.clearInterval(tick)
        timers.current.delete(tick)
        setMessages((all) => all.map((m) => (m.id === id ? { ...m, text } : m)))
        setStreaming(({ [id]: _done, ...rest }) => rest)
      }, WORD_MS)
      timers.current.add(tick)
    }, ANSWER_MS)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    ask(draft)
    setDraft('')
  }

  return (
    <>
      <button
        aria-controls="aiPanel"
        aria-expanded={open}
        aria-label={c(open ? 'assistant.close' : 'assistant.open')}
        className={lc('ai-fab')}
        onClick={() => setOpen((v) => !v)}
        ref={fab}
        type="button"
      >
        {open ? (
          <span aria-hidden="true" className={lc('ai-fab-x')}>
            ✕
          </span>
        ) : (
          <svg
            aria-hidden="true"
            className={lc('i ai-fab-spark')}
            viewBox="0 0 24 24"
          >
            <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />
          </svg>
        )}
      </button>
      <section
        aria-label={c('assistant.title')}
        className={lc('ai-panel')}
        id="aiPanel"
        onKeyDown={(e) => {
          if (e.key !== 'Escape') return
          setOpen(false)
          fab.current?.focus()
        }}
        ref={panel}
      >
        <div className={lc('ai-head')}>
          <span className={lc('mk')}>
            <svg aria-hidden="true" viewBox="371 117 795 775">
              <use fill="url(#bm)" href="#bitrate-logo" />
            </svg>
          </span>
          <span>
            <b className={lc('ai-title')}>{c('assistant.title')}</b>
            <small aria-live="polite">
              {phase === 'idle'
                ? c('assistant.status')
                : c('assistant.thinking')}
            </small>
          </span>
          <button
            aria-label={c('assistant.close')}
            className={lc('ai-x')}
            onClick={() => setOpen(false)}
            type="button"
          >
            ✕
          </button>
        </div>
        <div className={lc('ai-msgs')} ref={list}>
          {messages.length === 0 && (
            <div className={lc('ai-welcome')}>
              <AssistantOrb running={open} size={64} state="breathing" />
              <b>{c('assistant.welcome')}</b>
              <span className={lc('t-meta')}>
                {c('assistant.welcome_hint')}
              </span>
              <div className={lc('ai-chips')}>
                {PRESETS.map(({ q }) => (
                  <button
                    className={lc('ai-chip')}
                    key={q}
                    onClick={() => ask(c(q))}
                    type="button"
                  >
                    {c(q)}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m) => (
            <div className={lc(m.me ? 'ai-b me' : 'ai-b')} key={m.id}>
              {streaming[m.id] ?? m.text}
            </div>
          ))}
          {phase !== 'idle' && (
            <div className={lc('ai-typing')}>
              <AssistantOrb running={open} size={20} state={phase} />
              <span>{c('assistant.thinking')}</span>
            </div>
          )}
        </div>
        <form className={lc('ai-comp')} onSubmit={onSubmit}>
          <span className={lc('ai-in')}>
            <input
              aria-label={c('assistant.message')}
              autoComplete="off"
              onChange={(e) => setDraft(e.target.value)}
              placeholder={c('assistant.placeholder')}
              ref={input}
              type="text"
              value={draft}
            />
            <button
              aria-label={c('assistant.send')}
              className={lc('ai-send')}
              type="submit"
            >
              ↑
            </button>
          </span>
          <small>{c('assistant.disclaimer')}</small>
        </form>
      </section>
    </>
  )
}
