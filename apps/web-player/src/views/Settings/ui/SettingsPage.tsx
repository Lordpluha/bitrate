'use client'

import { useUpdateUser, useUploadUserAvatar } from '@entities/User'
import { clientFetchClient } from '@shared/api/client'
import { ensureOkResponse } from '@shared/api/errors'
import { showApiErrorToast, showApiSuccessToast } from '@shared/api/feedback'
import { apiQueryKeys } from '@shared/api/queryKeys'
import { useAuth } from '@shared/hooks'
import { ROUTES } from '@shared/routes'
import { cn } from '@spotify/ui-react'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronDown, ExternalLink, Info, Search } from 'lucide-react'
import Link from 'next/link'
import { type FormEvent, type ReactNode, useEffect, useState } from 'react'

type ToggleName =
  | 'normalizeVolume'
  | 'compactLibrary'
  | 'nowPlayingPanel'
  | 'musicVideos'
  | 'canvas'
  | 'otherVideos'
  | 'listeningActivity'
  | 'followers'
  | 'profilePlaylists'

export const SettingsPage = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const updateUser = useUpdateUser()
  const uploadAvatar = useUploadUserAvatar()
  const [username, setUsername] = useState('')
  const [description, setDescription] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [disableTwoFactorCode, setDisableTwoFactorCode] = useState('')
  const [twoFactorSetup, setTwoFactorSetup] = useState<{
    manualCode?: string
    qrCodeDataUrl?: string
  } | null>(null)
  const [isTwoFactorPending, setIsTwoFactorPending] = useState(false)
  const [language, setLanguage] = useState('English (English)')
  const [streamingQuality, setStreamingQuality] = useState('Automatic')
  const [toggles, setToggles] = useState<Record<ToggleName, boolean>>({
    canvas: true,
    compactLibrary: false,
    followers: true,
    listeningActivity: false,
    musicVideos: true,
    normalizeVolume: false,
    nowPlayingPanel: true,
    otherVideos: true,
    profilePlaylists: false,
  })

  const toggle = (name: ToggleName) => {
    setToggles((value) => ({ ...value, [name]: !value[name] }))
  }

  useEffect(() => {
    setUsername(user?.username ?? '')
    setDescription(user?.description ?? '')
  }, [user?.description, user?.username])

  const refreshMe = async () => {
    await queryClient.invalidateQueries({ queryKey: apiQueryKeys.auth.me })
  }

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextUsername = username.trim()
    const nextDescription = description.trim()

    if (nextUsername.length < 3) {
      showApiErrorToast(new Error('Username must be at least 3 characters.'))
      return
    }

    if (nextDescription.length > 500) {
      showApiErrorToast(
        new Error('Description must be 500 characters or less.'),
      )
      return
    }

    try {
      await updateUser.mutateAsync({
        body: {
          description: nextDescription || undefined,
          username: nextUsername,
        },
      })
      showApiSuccessToast('Profile updated')
    } catch (error) {
      showApiErrorToast(error, 'Failed to update profile')
    }
  }

  const handleAvatarChange = async (file: File | undefined) => {
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showApiErrorToast(new Error('Upload a PNG, JPEG, or WebP image.'))
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      showApiErrorToast(new Error('Avatar must be smaller than 2 MB.'))
      return
    }

    try {
      await uploadAvatar.mutateAsync(file)
      showApiSuccessToast('Avatar updated')
    } catch (error) {
      showApiErrorToast(error, 'Failed to upload avatar')
    }
  }

  const handleStartTwoFactorSetup = async () => {
    setIsTwoFactorPending(true)
    try {
      const { data, response } = await clientFetchClient.POST(
        '/api/v1/auth/2fa/setup',
      )
      ensureOkResponse(response, 'Failed to start 2FA setup')
      setTwoFactorSetup(data ?? null)
    } catch (error) {
      showApiErrorToast(error, 'Failed to start 2FA setup')
    } finally {
      setIsTwoFactorPending(false)
    }
  }

  const handleEnableTwoFactor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const code = twoFactorCode.trim()

    if (!/^\d{6}$/.test(code)) {
      showApiErrorToast(new Error('Enter the 6-digit 2FA code.'))
      return
    }

    setIsTwoFactorPending(true)
    try {
      const { response } = await clientFetchClient.POST(
        '/api/v1/auth/2fa/enable',
        {
          body: { code },
        },
      )
      ensureOkResponse(response, 'Failed to enable 2FA')
      setTwoFactorCode('')
      setTwoFactorSetup(null)
      await refreshMe()
      showApiSuccessToast('2FA enabled')
    } catch (error) {
      showApiErrorToast(error, 'Failed to enable 2FA')
    } finally {
      setIsTwoFactorPending(false)
    }
  }

  const handleDisableTwoFactor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const code = disableTwoFactorCode.trim()

    if (!/^\d{6}$/.test(code)) {
      showApiErrorToast(new Error('Enter the 6-digit 2FA code.'))
      return
    }

    setIsTwoFactorPending(true)
    try {
      const { response } = await clientFetchClient.DELETE(
        '/api/v1/auth/2fa/disable',
        {
          body: { code },
        },
      )
      ensureOkResponse(response, 'Failed to disable 2FA')
      setDisableTwoFactorCode('')
      await refreshMe()
      showApiSuccessToast('2FA disabled')
    } catch (error) {
      showApiErrorToast(error, 'Failed to disable 2FA')
    } finally {
      setIsTwoFactorPending(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto rounded-lg bg-background-secondary custom-scrollbar">
      <div className="mx-auto max-w-220 px-10 py-10 max-[900px]:px-5">
        <div className="mb-12 flex items-center justify-between">
          <h1 className="text-4xl font-black text-text">Settings</h1>
          <button
            aria-label="Search settings"
            className="rounded-full p-2 text-text-subdued transition-colors hover:bg-white/10 hover:text-text"
            type="button"
          >
            <Search size={22} />
          </button>
        </div>

        <div className="grid gap-8">
          <SettingsSection title="Account">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-text-subdued">Edit login methods</p>
              <Link
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2 text-sm font-bold text-text transition-colors hover:border-white"
                href={ROUTES.profile}
              >
                Edit
                <ExternalLink size={16} />
              </Link>
            </div>
          </SettingsSection>

          <SettingsSection title="Language">
            <SettingsRow label="Choose language - Changes will be applied after restarting the app">
              <SettingsSelect
                ariaLabel="Choose language"
                onChange={setLanguage}
                options={[
                  'English (English)',
                  'Русский (Russian)',
                  'Українська (Ukrainian)',
                ]}
                value={language}
                widthClassName="min-w-68"
              />
            </SettingsRow>
          </SettingsSection>

          <SettingsSection title="Audio quality">
            <SettingsRow label="Streaming quality">
              <SettingsSelect
                ariaLabel="Choose streaming quality"
                onChange={setStreamingQuality}
                options={['Automatic', 'Low', 'Normal', 'High']}
                value={streamingQuality}
                widthClassName="min-w-40"
              />
            </SettingsRow>
            <SettingsRow label="Normalize volume - Set the same volume level for all songs and podcasts">
              <Switch
                checked={toggles.normalizeVolume}
                onChange={() => toggle('normalizeVolume')}
              />
            </SettingsRow>
          </SettingsSection>

          <SettingsSection title="Your Library">
            <SettingsRow label="Use compact library layout">
              <Switch
                checked={toggles.compactLibrary}
                onChange={() => toggle('compactLibrary')}
              />
            </SettingsRow>
            <SettingsRow label="Import music from other apps">
              <button
                className="rounded-full border border-white/40 px-5 py-2 text-sm font-bold text-text transition-colors hover:border-white"
                type="button"
              >
                Import library
              </button>
            </SettingsRow>
          </SettingsSection>

          <SettingsSection title="Display">
            <SettingsRow label="Show the now-playing panel on click of play">
              <Switch
                checked={toggles.nowPlayingPanel}
                onChange={() => toggle('nowPlayingPanel')}
              />
            </SettingsRow>
          </SettingsSection>

          <SettingsSection title="Videos and Canvas">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold text-text">
              <Info size={16} />
              It may take some time for your experience to update.
            </div>
            <SettingsRow
              description="When off, music videos and live performances play as audio-only."
              label="Music videos"
            >
              <Switch
                checked={toggles.musicVideos}
                onChange={() => toggle('musicVideos')}
              />
            </SettingsRow>
            <SettingsRow
              description="Short, looping visuals when a song is playing."
              label="Canvas"
            >
              <Switch
                checked={toggles.canvas}
                onChange={() => toggle('canvas')}
              />
            </SettingsRow>
            <SettingsRow
              description="Vertically scrolling videos, video podcasts, and videos from creators and authors."
              label="Other videos"
            >
              <Switch
                checked={toggles.otherVideos}
                onChange={() => toggle('otherVideos')}
              />
            </SettingsRow>
          </SettingsSection>

          <SettingsSection title="Playback">
            <EqualizerPreview />
            <div className="mx-auto -mt-3 flex w-full max-w-180 items-center justify-between gap-5 rounded-lg bg-surface p-5 max-[900px]:grid">
              <div>
                <h3 className="text-2xl font-bold text-text">
                  Fine-tune your sound with the Linux app
                </h3>
                <p className="mt-2 text-text-subdued">
                  Improve streaming quality, adjust the equalizer to best fit
                  your speakers, and enjoy consistent volume across all your
                  tracks.
                </p>
              </div>
              <button
                className="shrink-0 rounded-full bg-green-500 px-7 py-3 font-bold text-black hover:bg-green-400"
                type="button"
              >
                Download the free app
              </button>
            </div>
          </SettingsSection>

          <SettingsSection title="Listening activity and insights">
            <SettingsRow
              description="People on Spotify can see the music you’re playing, stats on how your tastes compare and ask to Jam."
              label="Listening activity on desktop and mobile"
            >
              <Switch
                checked={toggles.listeningActivity}
                onChange={() => toggle('listeningActivity')}
              />
            </SettingsRow>
          </SettingsSection>

          <SettingsSection title="What others can see on your profile">
            <SettingsRow
              description="On your profile, people can see who's following you and who you’re following."
              label="Followers and following"
            >
              <Switch
                checked={toggles.followers}
                onChange={() => toggle('followers')}
              />
            </SettingsRow>
            <SettingsRow label="People can see the playlists you’ve added to your profile.">
              <Switch
                checked={toggles.profilePlaylists}
                onChange={() => toggle('profilePlaylists')}
              />
            </SettingsRow>
          </SettingsSection>

          <SettingsSection title="Profile details">
            <form
              className="grid max-w-160 gap-4"
              onSubmit={handleProfileSubmit}
            >
              <label className="grid gap-2 text-sm text-text">
                Username
                <input
                  className="h-10 rounded bg-surface px-3 text-sm text-text outline-none focus:ring-2 focus:ring-white/25"
                  maxLength={80}
                  minLength={3}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                  value={username}
                />
              </label>
              <label className="grid gap-2 text-sm text-text">
                Description
                <textarea
                  className="min-h-24 rounded bg-surface px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-white/25"
                  maxLength={500}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Tell people about yourself"
                  value={description}
                />
              </label>
              <button
                className="w-fit rounded-full bg-green-500 px-5 py-2 text-sm font-bold text-black hover:bg-green-400 disabled:opacity-60"
                disabled={updateUser.isPending}
                type="submit"
              >
                Save profile
              </button>
            </form>
            <label className="grid max-w-160 gap-2 text-sm text-text">
              Avatar
              <input
                accept="image/png,image/jpeg,image/webp"
                className="rounded bg-surface px-3 py-2 text-sm text-text"
                disabled={uploadAvatar.isPending}
                onChange={(event) =>
                  handleAvatarChange(event.target.files?.[0])
                }
                type="file"
              />
            </label>
          </SettingsSection>

          <SettingsSection title="Two-factor authentication">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-text-subdued">
                {user?.twoFactorEnabled
                  ? '2FA is enabled for this account.'
                  : 'Protect your account with an authenticator app.'}
              </p>
              {!user?.twoFactorEnabled && !twoFactorSetup && (
                <button
                  className="rounded-full bg-white/10 px-5 py-2 text-sm font-bold text-text hover:bg-white/15 disabled:opacity-60"
                  disabled={isTwoFactorPending}
                  onClick={handleStartTwoFactorSetup}
                  type="button"
                >
                  Set up 2FA
                </button>
              )}
            </div>

            {twoFactorSetup && !user?.twoFactorEnabled && (
              <form
                className="grid max-w-160 gap-3"
                onSubmit={handleEnableTwoFactor}
              >
                {twoFactorSetup.manualCode && (
                  <div className="rounded bg-surface p-3 text-sm text-text">
                    Manual code: <strong>{twoFactorSetup.manualCode}</strong>
                  </div>
                )}
                <input
                  className="h-10 rounded bg-surface px-3 text-sm text-text outline-none focus:ring-2 focus:ring-white/25"
                  inputMode="numeric"
                  maxLength={6}
                  onChange={(event) =>
                    setTwoFactorCode(event.target.value.replace(/\D/g, ''))
                  }
                  placeholder="Enter 6-digit code"
                  value={twoFactorCode}
                />
                <button
                  className="w-fit rounded-full bg-green-500 px-5 py-2 text-sm font-bold text-black hover:bg-green-400 disabled:opacity-60"
                  disabled={isTwoFactorPending}
                  type="submit"
                >
                  Enable 2FA
                </button>
              </form>
            )}

            {user?.twoFactorEnabled && (
              <form
                className="flex max-w-160 flex-wrap gap-3"
                onSubmit={handleDisableTwoFactor}
              >
                <input
                  className="h-10 rounded bg-surface px-3 text-sm text-text outline-none focus:ring-2 focus:ring-white/25"
                  inputMode="numeric"
                  maxLength={6}
                  onChange={(event) =>
                    setDisableTwoFactorCode(
                      event.target.value.replace(/\D/g, ''),
                    )
                  }
                  placeholder="Current 2FA code"
                  value={disableTwoFactorCode}
                />
                <button
                  className="rounded-full bg-red-500/15 px-5 py-2 text-sm font-bold text-red-200 hover:bg-red-500/25 disabled:opacity-60"
                  disabled={isTwoFactorPending}
                  type="submit"
                >
                  Disable 2FA
                </button>
              </form>
            )}
          </SettingsSection>
        </div>
      </div>
    </div>
  )
}

type SettingsSectionProps = {
  children: ReactNode
  title: string
}

const SettingsSection = ({ children, title }: SettingsSectionProps) => (
  <section>
    <h2 className="mb-4 text-base font-bold text-text">{title}</h2>
    <div className="grid gap-4">{children}</div>
  </section>
)

type SettingsRowProps = {
  children: ReactNode
  description?: string
  label: string
}

const SettingsRow = ({ children, description, label }: SettingsRowProps) => (
  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-5 max-[700px]:grid-cols-1">
    <div className="min-w-0">
      <p className="text-sm text-text-subdued">{label}</p>
      {description && (
        <p className="mt-1 max-w-150 text-xs text-text-subdued">
          {description}
        </p>
      )}
    </div>
    {children}
  </div>
)

type SettingsSelectProps = {
  ariaLabel: string
  onChange: (value: string) => void
  options: string[]
  value: string
  widthClassName?: string
}

const SettingsSelect = ({
  ariaLabel,
  onChange,
  options,
  value,
  widthClassName,
}: SettingsSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <fieldset
      className={cn('relative z-10 border-0 p-0', widthClassName)}
      onBlur={(event) => {
        const nextFocus = event.relatedTarget

        if (
          !(nextFocus instanceof Node) ||
          !event.currentTarget.contains(nextFocus)
        ) {
          setIsOpen(false)
        }
      }}
    >
      <button
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        className="flex h-10 w-full items-center justify-between gap-4 rounded bg-surface px-4 text-left text-sm text-text outline-none transition-colors hover:bg-surface-hover focus:ring-2 focus:ring-white/25"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="truncate">{value}</span>
        <ChevronDown
          className={cn(
            'shrink-0 text-text-subdued transition-transform',
            isOpen && 'rotate-180',
          )}
          size={16}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-[110] mt-1 max-h-56 w-full overflow-hidden rounded bg-background-tinted py-1 shadow-2xl ring-1 ring-border">
          {options.map((option) => (
            <button
              aria-selected={option === value}
              className={cn(
                'w-full px-4 py-2 text-left text-sm transition-colors hover:bg-surface-hover',
                option === value ? 'bg-surface text-text' : 'text-text-subdued',
              )}
              key={option}
              onClick={() => {
                onChange(option)
                setIsOpen(false)
              }}
              role="option"
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </fieldset>
  )
}

type SwitchProps = {
  checked: boolean
  onChange: () => void
}

const Switch = ({ checked, onChange }: SwitchProps) => (
  <button
    aria-pressed={checked}
    className={cn(
      'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-white/25',
      checked ? 'bg-green-500' : 'bg-surface-hover',
    )}
    onClick={onChange}
    type="button"
  >
    <span
      className={cn(
        'h-5 w-5 rounded-full bg-text shadow transition-transform',
        checked ? 'translate-x-5' : 'translate-x-0',
      )}
    />
  </button>
)

const EqualizerPreview = () => (
  <div className="mx-auto mt-2 w-full max-w-180 overflow-hidden rounded-lg bg-background-tinted px-7 pb-7 pt-10">
    <div className="relative h-72">
      <span className="absolute left-0 top-0 text-sm font-bold text-text-subdued">
        +12dB
      </span>
      <span className="absolute bottom-9 left-0 text-sm font-bold text-text-subdued">
        -12dB
      </span>

      <div className="absolute bottom-12 left-14 right-2 top-3">
        <div className="absolute inset-0 grid grid-cols-6">
          {['60Hz', '150Hz', '400Hz', '1KHz', '2.4KHz', '15KHz'].map(
            (label) => (
              <div
                className="relative border-l border-white/10 last:border-r"
                key={label}
              >
                <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-bold text-text-subdued">
                  {label}
                </span>
              </div>
            ),
          )}
        </div>
        <div className="absolute left-0 right-0 top-1/2 h-px bg-white/35" />
        <div className="absolute bottom-0 left-0 right-0 top-1/2 bg-gradient-to-b from-white/25 to-transparent" />
        <div className="absolute left-0 right-0 top-1/2 flex -translate-y-1/2 justify-between">
          {['60Hz', '150Hz', '400Hz', '1KHz', '2.4KHz', '15KHz'].map(
            (label) => (
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-text"
                key={label}
              />
            ),
          )}
        </div>
      </div>
    </div>
  </div>
)
