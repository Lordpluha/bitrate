import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  Check,
  CircleDashed,
  Files,
  Send,
  UsersRound,
} from 'lucide-react'
import Image from 'next/image'

const releaseSteps = [
  { label: 'Draft', state: 'done' },
  { label: 'Review', state: 'active' },
  { label: 'Deliver', state: 'waiting' },
  { label: 'Launch', state: 'waiting' },
] as const

const releaseStats = [
  { icon: Files, label: 'Versions', value: '03' },
  { icon: CalendarClock, label: 'Open tasks', value: '07' },
  { icon: UsersRound, label: 'Collaborators', value: '02' },
] as const

export function ArtistReleaseWorkspace() {
  return (
    <section
      className="border-border/70 border-t py-20 sm:py-28"
      id="for-artists"
    >
      <div className="container">
        <div className="mb-12 grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-primary">
              Artist concept
            </p>
            <h2 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Release work, in one line of sight.
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-neutral-400 lg:justify-self-end">
            Versions, tasks, delivery and post-release signals belong to one
            timeline. The assistant recommends a next step; the artist confirms
            it.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex flex-col gap-4 border-border border-b px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div className="flex items-center gap-4">
              <Image
                alt="Abstract magenta Afterglow cover"
                className="size-12 rounded-lg object-cover"
                height={48}
                src="/images/landing/signal-on-air/album-afterglow.webp"
                width={48}
              />
              <div>
                <h3 className="font-semibold">Afterglow</h3>
                <p className="mt-1 text-xs text-neutral-500">
                  Release workspace · Demo data
                </p>
              </div>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/40 px-3 py-1.5 text-xs font-medium text-primary">
              <span className="size-1.5 rounded-full bg-primary" />
              Review in progress
            </span>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1.3fr)_minmax(19rem,0.7fr)]">
            <div className="border-border p-5 sm:p-7 lg:border-r">
              <ol
                aria-label="Release stages"
                className="grid grid-cols-4 gap-3"
              >
                {releaseSteps.map((step, index) => (
                  <li className="min-w-0" key={step.label}>
                    <div className="mb-3 flex items-center">
                      <span
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${step.state === 'done' ? 'border-primary bg-primary text-white' : step.state === 'active' ? 'border-primary text-primary' : 'border-neutral-700 text-neutral-600'}`}
                      >
                        {step.state === 'done' ? (
                          <Check aria-hidden="true" className="size-4" />
                        ) : (
                          index + 1
                        )}
                      </span>
                      {index < releaseSteps.length - 1 ? (
                        <span
                          className={`h-px flex-1 ${step.state === 'done' ? 'bg-primary' : 'bg-neutral-800'}`}
                        />
                      ) : null}
                    </div>
                    <p
                      className={`truncate text-xs font-medium ${step.state === 'waiting' ? 'text-neutral-600' : 'text-neutral-200'}`}
                    >
                      {step.label}
                    </p>
                  </li>
                ))}
              </ol>

              <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
                {releaseStats.map(({ icon: Icon, label, value }) => (
                  <div className="bg-card p-4" key={label}>
                    <Icon aria-hidden="true" className="size-4 text-primary" />
                    <p className="mt-5 font-mono text-2xl font-semibold">
                      {value}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">{label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-border p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Current task
                    </p>
                    <h4 className="mt-3 font-semibold">
                      Approve the release pitch
                    </h4>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
                      Two phrases read like genre claims. Review the suggested
                      edit before the pitch moves to delivery.
                    </p>
                  </div>
                  <button
                    className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white"
                    type="button"
                  >
                    Review suggestion
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            <aside aria-label="Release next steps" className="p-5 sm:p-7">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest">
                  Next in line
                </p>
                <span className="font-mono text-xs text-neutral-600">
                  2 / 7
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-xl border border-primary/40 bg-primary/5 p-4">
                  <div className="flex items-start gap-3">
                    <BarChart3
                      aria-hidden="true"
                      className="mt-0.5 size-5 shrink-0 text-primary"
                    />
                    <div>
                      <p className="text-sm font-semibold">Release check</p>
                      <p className="mt-2 text-xs leading-5 text-neutral-400">
                        The master, artwork and metadata are aligned. Pitch copy
                        needs one decision.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-start gap-3">
                    <Send
                      aria-hidden="true"
                      className="mt-0.5 size-5 shrink-0 text-neutral-500"
                    />
                    <div>
                      <p className="text-sm font-semibold">Prepare delivery</p>
                      <p className="mt-2 text-xs leading-5 text-neutral-500">
                        Select services and confirm the release date.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-start gap-3">
                    <CircleDashed
                      aria-hidden="true"
                      className="mt-0.5 size-5 shrink-0 text-neutral-600"
                    />
                    <div>
                      <p className="text-sm font-semibold text-neutral-400">
                        Post-release review
                      </p>
                      <p className="mt-2 text-xs leading-5 text-neutral-600">
                        Analytics and follow-up tasks unlock after launch.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-6 border-border border-t pt-5 text-xs leading-5 text-neutral-600">
                Autopilot can prepare routine work, but publishing and delivery
                always wait for explicit confirmation.
              </p>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
