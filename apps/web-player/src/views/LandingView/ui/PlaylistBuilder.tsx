'use client'

import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  GripVertical,
  MessageCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

const initialTracks = [
  {
    title: 'Night Signal',
    image: '/images/landing/signal-on-air/album-night-signal.webp',
    duration: '3:56',
  },
  {
    title: 'Static Lines',
    image: '/images/landing/signal-on-air/album-static-lines.webp',
    duration: '3:47',
  },
  {
    title: 'Drift Control',
    image: '/images/landing/signal-on-air/album-drift-control.webp',
    duration: '3:19',
  },
  {
    title: 'Echoes in Motion',
    image: '/images/landing/signal-on-air/album-echoes-in-motion.webp',
    duration: '4:21',
  },
  {
    title: 'Afterglow',
    image: '/images/landing/signal-on-air/album-afterglow.webp',
    duration: '4:02',
  },
] as const

const stages = [
  { label: 'Goal', copy: 'Define the session' },
  { label: 'Source', copy: 'Choose a starting point' },
  { label: 'Tune', copy: 'Refine to your taste' },
] as const

const playlistSignal = Array.from({ length: 44 }, (_, index) => ({
  id: `signal-bar-${index + 1}`,
  height: 18 + ((index * 29) % 102),
  opacity: 0.22 + ((index * 7) % 6) * 0.1,
}))

type PlaylistTrack = (typeof initialTracks)[number]

export function PlaylistBuilder() {
  const [goal, setGoal] = useState(
    'Late-night training, focused but not aggressive',
  )
  const [tracks, setTracks] = useState<readonly PlaylistTrack[]>(initialTracks)
  const [useLikedSongs, setUseLikedSongs] = useState(true)
  const [showLesserKnown, setShowLesserKnown] = useState(true)
  const [draftReady, setDraftReady] = useState(false)

  const moveTrack = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= tracks.length) return

    const reordered = [...tracks]
    const currentTrack = reordered[index]
    const adjacentTrack = reordered[nextIndex]

    if (!currentTrack || !adjacentTrack) return

    reordered[index] = adjacentTrack
    reordered[nextIndex] = currentTrack
    setTracks(reordered)
    setDraftReady(false)
  }

  return (
    <section className="border-border/70 border-t py-20 sm:py-28">
      <div className="container grid gap-12 xl:grid-cols-[minmax(0,0.68fr)_minmax(0,1.32fr)] xl:gap-14">
        <div className="relative max-w-md overflow-hidden xl:pt-20">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            Concept preview
          </p>
          <h2 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
            Start with a feeling. Finish with your playlist.
          </h2>
          <p className="mt-6 text-lg leading-8 text-neutral-400">
            Describe the session, compare a few tracks and keep the final say.
          </p>
          <div className="mt-10 border-border border-l pl-5">
            <p className="text-sm leading-6 text-neutral-500">
              Questions adapt to the goal and stay capped at three to five
              steps.
            </p>
          </div>

          <div
            aria-hidden="true"
            className="mt-16 hidden h-44 items-end gap-1 overflow-hidden border-border border-b xl:flex"
          >
            {playlistSignal.map((bar) => (
              <span
                className="w-1 shrink-0 bg-primary/50"
                key={bar.id}
                style={{
                  height: `${bar.height}px`,
                  opacity: bar.opacity,
                }}
              />
            ))}
          </div>
        </div>

        <form
          className="overflow-hidden rounded-2xl border border-border bg-card"
          onSubmit={(event) => {
            event.preventDefault()
            setDraftReady(true)
          }}
        >
          <div className="flex items-center gap-2 border-border border-b px-5 py-4 text-sm font-medium uppercase tracking-wider text-primary">
            <span className="size-2 rounded-full bg-primary" />
            Playlist workshop
          </div>

          <ol className="grid gap-5 border-border border-b px-5 py-6 sm:grid-cols-3 sm:px-7">
            {stages.map((stage, index) => (
              <li className="flex min-w-0 items-center gap-3" key={stage.label}>
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${index === 0 ? 'border-primary bg-primary text-white' : 'border-neutral-600 text-neutral-300'}`}
                >
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{stage.label}</p>
                  <p className="mt-1 truncate text-xs text-neutral-500">
                    {stage.copy}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="grid lg:grid-cols-[minmax(13rem,0.72fr)_minmax(0,1.28fr)]">
            <div className="border-border p-5 sm:p-7 lg:border-r">
              <label className="text-sm font-semibold" htmlFor="playlist-goal">
                1. Tell us the goal
              </label>
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-border p-4 focus-within:border-primary">
                <MessageCircle
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-primary"
                />
                <textarea
                  className="min-h-24 w-full resize-none bg-transparent text-sm leading-6 text-white outline-none placeholder:text-neutral-600"
                  id="playlist-goal"
                  onChange={(event) => {
                    setGoal(event.target.value)
                    setDraftReady(false)
                  }}
                  value={goal}
                />
              </div>
              <div className="mt-5 flex items-start gap-3 border-border border-t pt-5 text-xs leading-5 text-neutral-500">
                <Sparkles
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-primary"
                />
                The next question is generated from this goal and your chosen
                source, not from a fixed genre list.
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold">
                    2. Which seed track is closest?
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-neutral-500">
                    Rank the options. The draft starts from the top.
                  </p>
                </div>
                <button
                  className="inline-flex min-h-9 items-center gap-2 self-start rounded-lg border border-border px-3 text-xs text-neutral-400 transition-colors hover:text-white"
                  onClick={() => {
                    setTracks(initialTracks)
                    setDraftReady(false)
                  }}
                  type="button"
                >
                  <RotateCcw aria-hidden="true" className="size-3.5" />
                  New five
                </button>
              </div>

              <ol className="mt-5 overflow-hidden rounded-xl border border-border">
                {tracks.map((track, index) => (
                  <li
                    className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3 border-border border-b p-3 last:border-b-0"
                    key={track.title}
                  >
                    <GripVertical
                      aria-hidden="true"
                      className="hidden size-4 text-neutral-600 sm:block"
                    />
                    <span className="flex size-7 items-center justify-center rounded-md border border-border font-mono text-xs text-neutral-300">
                      {index + 1}
                    </span>
                    <div className="flex min-w-0 items-center gap-3">
                      <Image
                        alt=""
                        className="size-11 rounded-md object-cover"
                        height={44}
                        src={track.image}
                        width={44}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {track.title}
                        </p>
                        <p className="mt-1 truncate text-xs text-neutral-500">
                          Demo artist · {track.duration}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        aria-label={`Move ${track.title} up`}
                        className="flex size-8 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                        disabled={index === 0}
                        onClick={() => moveTrack(index, -1)}
                        type="button"
                      >
                        <ArrowUp aria-hidden="true" className="size-4" />
                      </button>
                      <button
                        aria-label={`Move ${track.title} down`}
                        className="flex size-8 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                        disabled={index === tracks.length - 1}
                        onClick={() => moveTrack(index, 1)}
                        type="button"
                      >
                        <ArrowDown aria-hidden="true" className="size-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
                <label className="flex cursor-pointer items-start gap-3 bg-card p-4">
                  <input
                    checked={useLikedSongs}
                    className="mt-0.5 size-4 accent-primary"
                    onChange={(event) => {
                      setUseLikedSongs(event.target.checked)
                      setDraftReady(false)
                    }}
                    type="checkbox"
                  />
                  <span>
                    <span className="block text-sm font-medium">
                      Use liked songs
                    </span>
                    <span className="mt-1 block text-xs text-neutral-500">
                      Start from familiar signals
                    </span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 bg-card p-4">
                  <input
                    checked={showLesserKnown}
                    className="mt-0.5 size-4 accent-primary"
                    onChange={(event) => {
                      setShowLesserKnown(event.target.checked)
                      setDraftReady(false)
                    }}
                    type="checkbox"
                  />
                  <span>
                    <span className="block text-sm font-medium">
                      Show lesser-known artists
                    </span>
                    <span className="mt-1 block text-xs text-neutral-500">
                      Favor discovery over popularity
                    </span>
                  </span>
                </label>
              </div>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p aria-live="polite" className="text-xs text-neutral-500">
                  {draftReady ? (
                    <span className="inline-flex items-center gap-2 text-neutral-300">
                      <Check
                        aria-hidden="true"
                        className="size-4 text-primary"
                      />
                      Draft ready · 18 tracks · nothing saved yet
                    </span>
                  ) : (
                    'Your ranking stays editable before anything is saved.'
                  )}
                </p>
                <button
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-3 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                  type="submit"
                >
                  Build draft
                  <ArrowRight aria-hidden="true" className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}
