'use client'

import {
  Clock3,
  Heart,
  Home,
  ListMusic,
  MoreHorizontal,
  Pause,
  Play,
  Radio,
  Repeat2,
  Settings2,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
} from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

import { SignalWave } from './SignalWave'

const tracks = [
  {
    title: 'Night Signal',
    artist: 'Demo artist',
    duration: 236,
    image: '/images/landing/signal-on-air/album-night-signal.webp',
  },
  {
    title: 'Echoes in Motion',
    artist: 'Demo artist',
    duration: 261,
    image: '/images/landing/signal-on-air/album-echoes-in-motion.webp',
  },
  {
    title: 'Static Lines',
    artist: 'Demo artist',
    duration: 227,
    image: '/images/landing/signal-on-air/album-static-lines.webp',
  },
  {
    title: 'Drift Control',
    artist: 'Demo artist',
    duration: 199,
    image: '/images/landing/signal-on-air/album-drift-control.webp',
  },
  {
    title: 'Afterglow',
    artist: 'Demo artist',
    duration: 242,
    image: '/images/landing/signal-on-air/album-afterglow.webp',
  },
] as const

const queueOrder = [1, 2, 3, 0, 4] as const

function formatTime(value: number) {
  const seconds = Math.max(0, Math.floor(value))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export function SignalPlayer() {
  const [trackIndex, setTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLiked, setIsLiked] = useState(true)
  const [progress, setProgress] = useState(98)
  const [volume, setVolume] = useState(72)
  const track = tracks[trackIndex] ?? tracks[0]

  useEffect(() => {
    if (!isPlaying) return

    const timer = window.setInterval(() => {
      setProgress((current) => (current >= track.duration ? 0 : current + 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [isPlaying, track.duration])

  const selectTrack = (nextIndex: number) => {
    setTrackIndex(nextIndex)
    setProgress(0)
    setIsPlaying(true)
  }

  const moveTrack = (offset: number) => {
    const nextIndex = (trackIndex + offset + tracks.length) % tracks.length
    selectTrack(nextIndex)
  }

  return (
    <section
      aria-label="Interactive player preview"
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-black/20 shadow-xl"
    >
      <div className="flex items-center justify-between border-border border-b px-5 py-5 text-xs text-neutral-400 sm:px-6 lg:py-4 xl:py-5">
        <p className="flex items-center gap-2 font-medium uppercase tracking-widest text-purple-300">
          <span className="size-1.5 rounded-full bg-primary" />
          Now playing
        </p>
        <div className="hidden items-center gap-5 font-mono sm:flex">
          <span>Preview session</span>
          <span className="flex items-center gap-2 text-neutral-300">
            Signal stable
            <Radio aria-hidden="true" className="size-4 text-primary" />
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[3.5rem_minmax(0,1.08fr)_minmax(16rem,0.92fr)]">
        <nav
          aria-label="Player preview sections"
          className="hidden border-border border-r py-5 lg:flex lg:flex-col lg:items-center lg:gap-3"
        >
          {[Home, Heart, Clock3, ListMusic, Radio].map((Icon, index) => (
            <button
              aria-label={
                ['Home', 'Liked songs', 'Recents', 'Queue', 'Radio'][index]
              }
              className={`flex size-9 items-center justify-center rounded-lg transition-colors ${index === 0 ? 'bg-primary/20 text-purple-300' : 'text-neutral-500 hover:bg-surface hover:text-white'}`}
              key={Icon.displayName ?? index}
              type="button"
            >
              <Icon aria-hidden="true" className="size-4" />
            </button>
          ))}
          <div className="my-2 h-px w-7 bg-border" />
          <button
            aria-label="Player settings"
            className="flex size-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-surface hover:text-white"
            type="button"
          >
            <Settings2 aria-hidden="true" className="size-4" />
          </button>
          <div className="flex-1" />
          <div className="flex size-9 items-center justify-center rounded-full border border-border font-mono text-xs text-neutral-300">
            DJ
          </div>
        </nav>

        <div className="min-w-0 p-5 sm:p-8 lg:p-4 xl:p-8">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-950">
            <Image
              alt={`Abstract cover for ${track.title}`}
              className="size-full object-cover"
              height={640}
              priority
              src={track.image}
              width={640}
            />
            {isPlaying ? (
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-neutral-950/90 to-transparent p-4"
              >
                <SignalWave density="quiet" />
              </div>
            ) : null}
          </div>

          <div className="mt-5 flex items-start gap-4 lg:mt-3 xl:mt-5">
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-2xl font-semibold tracking-tight">
                {track.title}
              </h2>
              <p className="mt-1 text-sm text-neutral-400">{track.artist}</p>
            </div>
            <button
              aria-label={
                isLiked ? 'Remove from liked songs' : 'Add to liked songs'
              }
              aria-pressed={isLiked}
              className="flex size-10 items-center justify-center rounded-full text-neutral-300 transition-colors hover:bg-surface hover:text-white"
              onClick={() => setIsLiked((value) => !value)}
              type="button"
            >
              <Heart
                aria-hidden="true"
                className="size-5"
                fill={isLiked ? 'currentColor' : 'none'}
              />
            </button>
            <button
              aria-label="More track options"
              className="flex size-10 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-surface hover:text-white"
              type="button"
            >
              <MoreHorizontal aria-hidden="true" className="size-5" />
            </button>
          </div>

          <label className="mt-5 block lg:mt-3 xl:mt-5">
            <span className="sr-only">Track progress</span>
            <input
              aria-valuetext={`${formatTime(progress)} of ${formatTime(track.duration)}`}
              className="h-4 w-full cursor-pointer accent-primary"
              max={track.duration}
              min={0}
              onChange={(event) => setProgress(Number(event.target.value))}
              type="range"
              value={progress}
            />
          </label>
          <div className="mt-1 flex justify-between font-mono text-xs text-neutral-500">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(track.duration)}</span>
          </div>

          <div className="mt-5 flex items-center justify-center gap-3 sm:gap-5 lg:mt-3 xl:mt-5">
            <button
              aria-label="Shuffle queue"
              className="flex size-10 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-surface hover:text-white"
              type="button"
            >
              <Shuffle aria-hidden="true" className="size-4" />
            </button>
            <button
              aria-label="Previous track"
              className="flex size-10 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-surface hover:text-white"
              onClick={() => moveTrack(-1)}
              type="button"
            >
              <SkipBack
                aria-hidden="true"
                className="size-5"
                fill="currentColor"
              />
            </button>
            <button
              aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
              aria-pressed={isPlaying}
              className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary-hover"
              onClick={() => setIsPlaying((value) => !value)}
              type="button"
            >
              {isPlaying ? (
                <Pause
                  aria-hidden="true"
                  className="size-6"
                  fill="currentColor"
                />
              ) : (
                <Play
                  aria-hidden="true"
                  className="size-6"
                  fill="currentColor"
                />
              )}
            </button>
            <button
              aria-label="Next track"
              className="flex size-10 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-surface hover:text-white"
              onClick={() => moveTrack(1)}
              type="button"
            >
              <SkipForward
                aria-hidden="true"
                className="size-5"
                fill="currentColor"
              />
            </button>
            <button
              aria-label="Repeat queue"
              className="flex size-10 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-surface hover:text-white"
              type="button"
            >
              <Repeat2 aria-hidden="true" className="size-4" />
            </button>
          </div>
        </div>

        <aside
          aria-label="Up next"
          className="border-border border-t p-5 sm:p-8 lg:border-t-0 lg:border-l lg:p-4 xl:p-8"
        >
          <div className="flex items-center justify-between border-border border-b pb-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest">
              Up next
            </h3>
            <button
              className="text-xs text-neutral-500 transition-colors hover:text-white"
              type="button"
            >
              Clear
            </button>
          </div>
          <div className="mt-3 space-y-1">
            {queueOrder.map((index) => {
              const queueTrack = tracks[index]
              const selected = index === trackIndex
              return (
                <button
                  aria-current={selected ? 'true' : undefined}
                  className={`group flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors ${selected ? 'bg-primary/10' : 'hover:bg-surface'}`}
                  key={queueTrack.title}
                  onClick={() => selectTrack(index)}
                  type="button"
                >
                  <Image
                    alt=""
                    className="size-11 rounded-md object-cover"
                    height={44}
                    src={queueTrack.image}
                    width={44}
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-sm font-medium ${selected ? 'text-purple-300' : 'text-white'}`}
                    >
                      {queueTrack.title}
                    </span>
                    <span className="block truncate text-xs text-neutral-500">
                      {queueTrack.artist}
                    </span>
                  </span>
                  {selected && isPlaying ? (
                    <Radio
                      aria-label="Playing"
                      className="size-4 text-primary"
                    />
                  ) : (
                    <span className="font-mono text-xs text-neutral-500">
                      {formatTime(queueTrack.duration)}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <label className="mt-7 flex items-center gap-3 border-border border-t pt-5">
            <Volume2
              aria-hidden="true"
              className="size-4 shrink-0 text-neutral-400"
            />
            <span className="sr-only">Preview volume</span>
            <input
              aria-valuetext={`${volume} percent`}
              className="h-4 min-w-0 flex-1 cursor-pointer accent-primary"
              max={100}
              min={0}
              onChange={(event) => setVolume(Number(event.target.value))}
              type="range"
              value={volume}
            />
          </label>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-px border-border border-t bg-border font-mono text-xs sm:grid-cols-4">
        {[
          ['Source', 'Bitrate'],
          ['Stream', 'Preview'],
          ['Output', 'Web'],
          ['Status', isPlaying ? 'Playing' : 'Ready'],
        ].map(([label, value]) => (
          <div className="bg-card px-4 py-4 xl:py-6" key={label}>
            <p className="uppercase tracking-widest text-neutral-600">
              {label}
            </p>
            <p className="mt-1 text-neutral-300">{value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
