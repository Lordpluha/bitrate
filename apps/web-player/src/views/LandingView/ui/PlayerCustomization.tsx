'use client'

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Columns2,
  ListMusic,
  PanelRight,
  Pause,
  Play,
  SlidersHorizontal,
  Square,
  Volume2,
} from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

const previewTracks = [
  {
    title: 'Echoes in Motion',
    image: '/images/landing/signal-on-air/album-echoes-in-motion.webp',
    duration: '4:21',
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
] as const

const densityOptions = ['Focused', 'Balanced', 'Detailed'] as const
type Density = (typeof densityOptions)[number]

const artworkOptions = [
  { icon: Square, label: 'Wide artwork' },
  { icon: Columns2, label: 'Balanced artwork' },
  { icon: PanelRight, label: 'Large artwork' },
] as const

const queuePositions = [
  { label: 'Left', value: false },
  { label: 'Right', value: true },
] as const

const densityStyles: Record<Density, string> = {
  Focused: 'space-y-0',
  Balanced: 'space-y-1',
  Detailed: 'space-y-3',
}

export function PlayerCustomization() {
  const [density, setDensity] = useState<Density>('Balanced')
  const [artworkFocus, setArtworkFocus] = useState(1)
  const [queueOnRight, setQueueOnRight] = useState(true)
  const [compactControls, setCompactControls] = useState(true)

  return (
    <section className="border-border/70 border-t py-20 sm:py-28">
      <div className="container grid gap-12 xl:grid-cols-[minmax(0,0.68fr)_minmax(0,1.32fr)] xl:gap-14">
        <div className="max-w-md xl:pt-20">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            Concept preview
          </p>
          <h2 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
            Shape the player around your session.
          </h2>
          <p className="mt-6 text-lg leading-8 text-neutral-400">
            Choose density, panel emphasis and what stays within reach.
          </p>
          <div className="mt-10 border-border border-l pl-5">
            <p className="text-sm leading-6 text-neutral-500">
              A constrained system keeps every layout readable and reversible.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-border border-b px-5 py-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <SlidersHorizontal
                aria-hidden="true"
                className="size-4 text-primary"
              />
              Player configuration
            </p>
            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-neutral-500 sm:inline">
                Balanced view
              </span>
              <button
                aria-label="Previous saved view"
                className="flex size-9 items-center justify-center rounded-lg border border-border text-neutral-400 transition-colors hover:text-white"
                type="button"
              >
                <ChevronLeft aria-hidden="true" className="size-4" />
              </button>
              <button
                aria-label="Next saved view"
                className="flex size-9 items-center justify-center rounded-lg border border-border text-neutral-400 transition-colors hover:text-white"
                type="button"
              >
                <ChevronRight aria-hidden="true" className="size-4" />
              </button>
            </div>
          </div>

          <div
            className={`grid xl:grid-cols-[minmax(0,1fr)_18rem] ${queueOnRight ? '' : 'xl:[&>*:first-child]:order-2'}`}
          >
            <div className="min-w-0 p-5 sm:p-7">
              <div className="grid gap-5 sm:grid-cols-[minmax(11rem,0.9fr)_minmax(0,1.1fr)]">
                <div className="min-w-0">
                  <Image
                    alt="Abstract Night Signal cover"
                    className={`w-full rounded-xl object-cover ${artworkFocus === 0 ? 'aspect-video' : artworkFocus === 2 ? 'aspect-square' : 'aspect-4/3'}`}
                    height={520}
                    src="/images/landing/signal-on-air/album-night-signal.webp"
                    width={520}
                  />
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Night Signal</h3>
                      <p className="mt-1 text-xs text-neutral-500">
                        Demo artist
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-2 ${compactControls ? 'text-neutral-400' : 'rounded-lg border border-border p-2 text-white'}`}
                    >
                      <Play
                        aria-hidden="true"
                        className="size-4"
                        fill="currentColor"
                      />
                      <Pause
                        aria-hidden="true"
                        className="size-4"
                        fill="currentColor"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="font-mono text-xs text-neutral-600">
                      1:38
                    </span>
                    <div className="h-1 flex-1 rounded-full bg-neutral-800">
                      <div className="h-full w-2/5 rounded-full bg-primary" />
                    </div>
                    <span className="font-mono text-xs text-neutral-600">
                      3:56
                    </span>
                  </div>
                </div>

                <div className="border-border sm:border-l sm:pl-5">
                  <div className="flex items-center justify-between border-border border-b pb-4">
                    <h3 className="text-xs font-semibold uppercase tracking-widest">
                      Up next
                    </h3>
                    <ListMusic
                      aria-hidden="true"
                      className="size-4 text-neutral-500"
                    />
                  </div>
                  <div className={`mt-3 ${densityStyles[density]}`}>
                    {previewTracks.map((track) => (
                      <div
                        className="flex items-center gap-3 border-border border-b py-3 last:border-b-0"
                        key={track.title}
                      >
                        <Image
                          alt=""
                          className="size-10 rounded-md object-cover"
                          height={40}
                          src={track.image}
                          width={40}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {track.title}
                          </p>
                          {density !== 'Focused' ? (
                            <p className="mt-1 text-xs text-neutral-600">
                              Demo artist
                            </p>
                          ) : null}
                        </div>
                        {density === 'Detailed' ? (
                          <span className="font-mono text-xs text-neutral-600">
                            {track.duration}
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center gap-3 border-border border-t pt-5">
                    <Volume2
                      aria-hidden="true"
                      className="size-4 text-neutral-500"
                    />
                    <div className="h-1 flex-1 rounded-full bg-neutral-800">
                      <div className="h-full w-3/5 rounded-full bg-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <form
              className="border-border border-t p-5 xl:border-t-0 xl:border-l"
              onSubmit={(event) => event.preventDefault()}
            >
              <fieldset>
                <legend className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                  Density
                </legend>
                <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-lg border border-border">
                  {densityOptions.map((option) => (
                    <button
                      aria-pressed={density === option}
                      className={`min-h-10 border-border border-r px-2 text-xs last:border-r-0 ${density === option ? 'bg-primary text-white' : 'text-neutral-400 hover:text-white'}`}
                      key={option}
                      onClick={() => setDensity(option)}
                      type="button"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-7 border-border border-t pt-6">
                <legend className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                  Artwork focus
                </legend>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {artworkOptions.map(({ icon: Icon, label }, index) => (
                    <button
                      aria-label={label}
                      aria-pressed={artworkFocus === index}
                      className={`flex min-h-11 items-center justify-center rounded-lg border ${artworkFocus === index ? 'border-primary text-primary' : 'border-border text-neutral-500 hover:text-white'}`}
                      key={label}
                      onClick={() => setArtworkFocus(index)}
                      type="button"
                    >
                      <Icon aria-hidden="true" className="size-4" />
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-7 border-border border-t pt-6">
                <legend className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                  Queue position
                </legend>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {queuePositions.map(({ label, value }) => (
                    <button
                      aria-pressed={queueOnRight === value}
                      className={`min-h-10 rounded-lg border text-xs ${queueOnRight === value ? 'border-primary text-primary' : 'border-border text-neutral-500 hover:text-white'}`}
                      key={label}
                      onClick={() => setQueueOnRight(value)}
                      type="button"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="mt-7 flex cursor-pointer items-center justify-between border-border border-t pt-6">
                <span>
                  <span className="block text-sm font-medium">
                    Compact controls
                  </span>
                  <span className="mt-1 block text-xs text-neutral-600">
                    Reduce control size and spacing
                  </span>
                </span>
                <input
                  checked={compactControls}
                  className="size-4 accent-primary"
                  onChange={(event) => setCompactControls(event.target.checked)}
                  type="checkbox"
                />
              </label>

              <div
                aria-live="polite"
                className="mt-7 flex items-center gap-2 border-border border-t pt-5 text-xs text-neutral-500"
              >
                <Check aria-hidden="true" className="size-4 text-primary" />
                Preview updates immediately
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
