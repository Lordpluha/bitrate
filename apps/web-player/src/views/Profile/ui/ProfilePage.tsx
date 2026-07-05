'use client'

import { useMyPlaylists } from '@entities/Playlist'
import { useUpdateUser, useUploadUserAvatar } from '@entities/User'
import { clientFetchClient } from '@shared/api/client'
import { ensureOkResponse } from '@shared/api/errors'
import { showApiErrorToast, showApiSuccessToast } from '@shared/api/feedback'
import { apiQueryKeys } from '@shared/api/queryKeys'
import { useAuth } from '@shared/hooks'
import { useLikedTracks } from '@shared/hooks/useLikedTracks'
import { ROUTES } from '@shared/routes'
import { generateColor } from '@shared/utils'
import { getPlaylistCoverUrl, getUserAvatarUrl } from '@shared/utils/mediaUrl'
import { useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { type FormEvent, useEffect, useMemo, useState } from 'react'

type ProfilePlaylist = {
  id: string
  title: string
  cover?: string | null
  description?: string | null
}

const MAX_AVATAR_SIZE = 2 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const ProfilePage = () => {
  const queryClient = useQueryClient()
  const { user, isLoading } = useAuth()
  const updateUser = useUpdateUser()
  const uploadAvatar = useUploadUserAvatar()
  const { data: playlists } = useMyPlaylists()
  const { data: likedTracks } = useLikedTracks(1, 12)
  const [username, setUsername] = useState('')
  const [description, setDescription] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [disableTwoFactorCode, setDisableTwoFactorCode] = useState('')
  const [twoFactorSetup, setTwoFactorSetup] = useState<{
    manualCode?: string
    qrCodeDataUrl?: string
  } | null>(null)
  const [isTwoFactorPending, setIsTwoFactorPending] = useState(false)

  useEffect(() => {
    setUsername(user?.username ?? '')
    setDescription(user?.description ?? '')
  }, [user?.description, user?.username])

  const userPlaylists = useMemo(
    () => (Array.isArray(playlists) ? (playlists as ProfilePlaylist[]) : []),
    [playlists],
  )

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto custom-scrollbar px-6 py-5 text-text-subdued">
        Loading profile...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-full overflow-y-auto custom-scrollbar px-6 py-5">
        <div className="rounded-lg bg-surface p-6 text-text-subdued">
          Sign in to view your profile.
        </div>
      </div>
    )
  }

  const avatarUrl = user.avatar ? getUserAvatarUrl(user.avatar) : null
  const firstLetter = user.username.charAt(0).toUpperCase()
  const backgroundColor = generateColor(user.username)

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextUsername = username.trim()
    const nextDescription = description.trim()

    if (nextUsername.length < 3) {
      showApiErrorToast(
        new Error('Username must be at least 3 characters long.'),
      )
      return
    }

    if (nextDescription.length > 500) {
      showApiErrorToast(
        new Error('Description must be 500 characters or less.'),
      )
      return
    }

    await updateUser.mutateAsync({
      body: {
        description: nextDescription || undefined,
        username: nextUsername,
      },
    })
    showApiSuccessToast('Profile updated')
  }

  const handleAvatarChange = async (file: File | undefined) => {
    if (!file) return

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      showApiErrorToast(new Error('Upload a PNG, JPEG, or WebP image.'))
      return
    }

    if (file.size > MAX_AVATAR_SIZE) {
      showApiErrorToast(new Error('Avatar must be smaller than 2 MB.'))
      return
    }

    await uploadAvatar.mutateAsync(file)
    showApiSuccessToast('Avatar updated')
  }

  const refreshMe = async () => {
    await queryClient.invalidateQueries({ queryKey: apiQueryKeys.auth.me })
  }

  const handleStartTwoFactorSetup = async () => {
    setIsTwoFactorPending(true)
    try {
      const { data, response } = await clientFetchClient.POST(
        '/api/v1/auth/2fa/setup',
      )
      ensureOkResponse(response, 'Failed to start 2FA setup')
      setTwoFactorSetup(data ?? null)
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
    } finally {
      setIsTwoFactorPending(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar px-6 py-5">
      <section className="rounded-lg bg-surface p-6">
        <div className="flex flex-wrap items-end gap-6">
          <div className="relative h-36 w-36 overflow-hidden rounded-full bg-background">
            {avatarUrl ? (
              <Image
                alt={user.username}
                className="h-full w-full object-cover"
                height={144}
                src={avatarUrl}
                unoptimized
                width={144}
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-6xl font-bold text-black"
                style={{ backgroundColor }}
              >
                {firstLetter}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold uppercase text-text-subdued">
              Profile
            </p>
            <h1 className="truncate text-5xl font-bold text-text">
              {user.username}
            </h1>
            <p className="mt-2 max-w-180 text-sm text-text-subdued">
              {user.description || 'No description yet.'}
            </p>
            <p className="mt-3 text-sm text-text-subdued">
              {userPlaylists.length} playlists • {likedTracks?.length ?? 0}{' '}
              liked tracks
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <form
          className="grid gap-4 rounded-lg bg-surface p-5"
          onSubmit={handleProfileSubmit}
        >
          <h2 className="text-xl font-bold text-text">Edit profile</h2>
          <label className="grid gap-2 text-sm text-text">
            Username
            <input
              className="h-10 rounded-md bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-white/30"
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
              className="min-h-28 rounded-md bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30"
              maxLength={500}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Tell people about yourself"
              value={description}
            />
          </label>
          <button
            className="w-fit rounded-full bg-green-500 px-5 py-2 text-sm font-semibold text-black hover:bg-green-400 disabled:opacity-60"
            disabled={updateUser.isPending}
            type="submit"
          >
            Save profile
          </button>
        </form>

        <div className="grid content-start gap-4 rounded-lg bg-surface p-5">
          <h2 className="text-xl font-bold text-text">Avatar</h2>
          <p className="text-sm text-text-subdued">
            PNG, JPEG, or WebP. Maximum size 5 MB.
          </p>
          <input
            accept="image/png,image/jpeg,image/webp"
            className="text-sm text-text"
            disabled={uploadAvatar.isPending}
            onChange={(event) => handleAvatarChange(event.target.files?.[0])}
            type="file"
          />
        </div>
      </section>

      <section className="mt-6 rounded-lg bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-text">
              Two-factor authentication
            </h2>
            <p className="mt-1 text-sm text-text-subdued">
              {user.twoFactorEnabled
                ? '2FA is enabled for this account.'
                : 'Protect your account with an authenticator app.'}
            </p>
          </div>
          {!user.twoFactorEnabled && !twoFactorSetup && (
            <button
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-text hover:bg-white/15 disabled:opacity-60"
              disabled={isTwoFactorPending}
              onClick={handleStartTwoFactorSetup}
              type="button"
            >
              Set up 2FA
            </button>
          )}
        </div>

        {twoFactorSetup && !user.twoFactorEnabled && (
          <div className="mt-5 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
            {twoFactorSetup.qrCodeDataUrl && (
              <Image
                alt="2FA QR code"
                className="rounded-md bg-white p-2"
                height={220}
                src={twoFactorSetup.qrCodeDataUrl}
                unoptimized
                width={220}
              />
            )}
            <form
              className="grid content-start gap-3"
              onSubmit={handleEnableTwoFactor}
            >
              {twoFactorSetup.manualCode && (
                <div className="rounded-md bg-background p-3 text-sm text-text">
                  Manual code: <strong>{twoFactorSetup.manualCode}</strong>
                </div>
              )}
              <input
                className="h-10 rounded-md bg-background px-3 text-sm text-text outline-none focus:ring-2 focus:ring-white/30"
                inputMode="numeric"
                maxLength={6}
                onChange={(event) =>
                  setTwoFactorCode(event.target.value.replace(/\D/g, ''))
                }
                placeholder="Enter 6-digit code"
                value={twoFactorCode}
              />
              <button
                className="w-fit rounded-full bg-green-500 px-5 py-2 text-sm font-semibold text-black hover:bg-green-400 disabled:opacity-60"
                disabled={isTwoFactorPending}
                type="submit"
              >
                Enable 2FA
              </button>
            </form>
          </div>
        )}

        {user.twoFactorEnabled && (
          <form
            className="mt-5 flex flex-wrap gap-3"
            onSubmit={handleDisableTwoFactor}
          >
            <input
              className="h-10 rounded-md bg-background px-3 text-sm text-text outline-none focus:ring-2 focus:ring-white/30"
              inputMode="numeric"
              maxLength={6}
              onChange={(event) =>
                setDisableTwoFactorCode(event.target.value.replace(/\D/g, ''))
              }
              placeholder="Current 2FA code"
              value={disableTwoFactorCode}
            />
            <button
              className="rounded-full bg-red-500/15 px-5 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/25 disabled:opacity-60"
              disabled={isTwoFactorPending}
              type="submit"
            >
              Disable 2FA
            </button>
          </form>
        )}
      </section>

      <section className="mt-6">
        <h2 className="mb-4 text-2xl font-bold text-text">Your playlists</h2>
        {userPlaylists.length === 0 ? (
          <div className="rounded-lg bg-surface p-6 text-text-subdued">
            No playlists yet.
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
            {userPlaylists.map((playlist) => (
              <Link
                className="rounded-lg p-3 transition-colors hover:bg-surface"
                href={ROUTES.playlist(playlist.id)}
                key={playlist.id}
              >
                <Image
                  alt={playlist.title}
                  className="aspect-square w-full rounded-md object-cover"
                  height={180}
                  src={getPlaylistCoverUrl(playlist.cover)}
                  unoptimized
                  width={180}
                />
                <h3 className="mt-3 truncate text-sm font-medium text-text">
                  {playlist.title}
                </h3>
                <p className="truncate text-xs text-text-subdued">
                  {playlist.description || 'Playlist'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
