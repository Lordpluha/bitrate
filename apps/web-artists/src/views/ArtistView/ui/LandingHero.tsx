import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  ChartNoAxesCombined,
  Disc3,
  LayoutDashboard,
} from 'lucide-react'
import { type CSSProperties, useEffect, useRef, useState } from 'react'
import {
  isMotionReduced,
  magneticHandlers,
  useContainerScrollFlatten,
} from '../lib/landingInteractions'
import {
  LandingWorkspaceReplica,
  type StudioPreviewTab,
} from './LandingWorkspaceReplica'

const MORPH_PHRASES = [
  'landing.hero.master',
  'landing.hero.lifecycle',
  'landing.hero.credits',
  'landing.hero.premiere',
  'landing.hero.analytics',
] as const

const STUDIO_TABS = [
  {
    id: 'workspace' as const,
    step: '01',
    label: 'landing.hero.workspace',
    icon: Disc3,
  },
  {
    id: 'dashboard' as const,
    step: '02',
    label: 'shell.nav.dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'analytics' as const,
    step: '03',
    label: 'shell.nav.analytics',
    icon: ChartNoAxesCombined,
  },
] as const

export const LandingHero = () => {
  const { t } = useI18n()
  const title = t('landing.title')
  const titleWords = title.split(' ')

  const [morphIndex, setMorphIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<StudioPreviewTab>('workspace')

  const scrollFrameRef = useRef<HTMLDivElement>(null)

  useContainerScrollFlatten(scrollFrameRef)

  // Cycle Text Morph phrase every 3s unless reduced motion is active
  useEffect(() => {
    if (isMotionReduced()) return
    const timer = window.setInterval(() => {
      setMorphIndex((current) => (current + 1) % MORPH_PHRASES.length)
    }, 3000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <section
      aria-labelledby="landing-title"
      className="relative mx-auto max-w-7xl px-4 pt-10 pb-16 sm:px-8 lg:pt-14 lg:pb-24"
      id="landing-hero"
    >
      {/* Top Centered Hero Copy (Reflect & Wope style) */}
      <div className="artist-hero-copy mx-auto flex max-w-4xl flex-col items-center text-center">
        {/* Moving Border Eyebrow Pill */}
        <div className="artist-hero-eyebrow artist-moving-border artist-moving-border-badge inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-sm font-medium text-purple-200 shadow-lg">
          <span className="font-semibold uppercase tracking-[0.14em]">
            {t('landing.eyebrow')}
          </span>
          <span
            aria-hidden="true"
            className="artist-hero-eyebrow-divider text-white/25"
          >
            ·
          </span>
          <span className="artist-hero-eyebrow-meta font-mono text-sm text-purple-300/90">
            STUDIO RELEASE OS
          </span>
        </div>

        {/* Split Text Main Display Headline */}
        <h1
          aria-label={title}
          className="mt-6 text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[4rem]"
          id="landing-title"
        >
          {titleWords.map((word, index) => (
            <span
              aria-hidden="true"
              className="artist-split-word mr-[0.26em] last:mr-0"
              key={`${word}-${
                // biome-ignore lint/suspicious/noArrayIndexKey: static split words from i18n title
                index
              }`}
              style={{ '--word-index': index } as CSSProperties}
            >
              {word}
            </span>
          ))}
        </h1>

        {/* Interactive Text Morph Bar */}
        <div className="artist-hero-capabilities mt-5 flex flex-wrap items-center justify-center gap-2 text-sm text-text-secondary">
          <span>{t('landing.hero.engineered')}</span>
          <button
            className="artist-text-morph-pill cursor-pointer"
            key={t(MORPH_PHRASES[morphIndex])}
            onClick={() =>
              setMorphIndex((current) => (current + 1) % MORPH_PHRASES.length)
            }
            title={t('landing.hero.cycle')}
            type="button"
          >
            <span className="size-1.5 rounded-full bg-purple-400" />
            <span>{t(MORPH_PHRASES[morphIndex])}</span>
          </button>
        </div>

        {/* Subtitle / Lead */}
        <p className="artist-hero-lead mt-5 max-w-2xl text-pretty text-base leading-relaxed text-text-secondary sm:text-lg">
          {t('landing.lead')}
        </p>

        {/* Primary & Secondary CTAs with Moving Border + Magnetic Pull */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            className="artist-moving-border artist-moving-border-cta artist-magnetic-item inline-flex h-12 items-center gap-2.5 rounded-xl px-6 text-sm font-semibold text-white"
            to={ROUTES.auth.registration}
            {...magneticHandlers}
          >
            <span>{t('landing.createAccount')}</span>
            <ArrowRight aria-hidden="true" className="size-4 text-purple-200" />
          </Link>

          <Link
            className="artist-magnetic-item inline-flex h-12 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 text-sm font-medium text-foreground backdrop-blur-md transition-colors hover:border-purple-400/40 hover:bg-white/10"
            to={ROUTES.auth.login}
            {...magneticHandlers}
          >
            {t('landing.logIn')}
          </Link>
        </div>
      </div>

      {/* Interactive Magnetic Stage Switcher Dock above the 3D Studio Window */}
      <div
        className="mt-12 flex flex-col items-center"
        id="landing-studio-stage"
      >
        <div
          aria-label="Interactive studio preview modes"
          className="artist-landing-dock flex-wrap justify-center"
          role="tablist"
        >
          {STUDIO_TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                aria-controls="studio-preview-panel"
                aria-label={`${tab.step} ${t(tab.label)}`}
                aria-selected={isActive}
                className="artist-landing-dock-pill artist-magnetic-item inline-flex cursor-pointer items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium text-text-secondary hover:text-foreground"
                data-active={isActive ? 'true' : undefined}
                id={`studio-preview-tab-${tab.id}`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(event) => {
                  const offset =
                    event.key === 'ArrowRight'
                      ? 1
                      : event.key === 'ArrowLeft'
                        ? -1
                        : 0
                  const index = STUDIO_TABS.findIndex(
                    (item) => item.id === tab.id,
                  )
                  const next =
                    event.key === 'Home'
                      ? 0
                      : event.key === 'End'
                        ? STUDIO_TABS.length - 1
                        : (index + offset + STUDIO_TABS.length) %
                          STUDIO_TABS.length
                  if (!offset && event.key !== 'Home' && event.key !== 'End')
                    return
                  event.preventDefault()
                  setActiveTab(STUDIO_TABS[next].id)
                  document
                    .getElementById(
                      `studio-preview-tab-${STUDIO_TABS[next].id}`,
                    )
                    ?.focus()
                }}
                role="tab"
                tabIndex={isActive ? 0 : -1}
                type="button"
                {...magneticHandlers}
              >
                <span className="studio-preview-tab-step font-mono text-sm text-purple-300/80">
                  {tab.step}
                </span>
                <Icon aria-hidden="true" className="size-3.5 text-purple-300" />
                <span className="studio-preview-tab-label">{t(tab.label)}</span>
                <span className="studio-preview-tab-short">
                  {tab.id === 'workspace'
                    ? t('music.table.release')
                    : t(tab.label)}
                </span>
              </button>
            )
          })}
        </div>

        {/* Aceternity-style 3D Container Scroll Studio Bezel + Magic UI Border Beam + 1:1 `web-artists` Replica */}
        <div className="artist-scroll-perspective mt-6 w-full">
          <div className="artist-scroll-bezel" ref={scrollFrameRef}>
            <div aria-hidden="true" className="artist-border-beam" />
            <div className="artist-studio-screen">
              <LandingWorkspaceReplica
                activeTab={activeTab}
                onSelectTab={setActiveTab}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
