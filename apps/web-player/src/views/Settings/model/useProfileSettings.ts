import { type FormEvent, useEffect, useState } from 'react'
import { useUpdateUser, useUploadUserAvatar } from '@/entities/User'
import { showApiErrorToast, showApiSuccessToast } from '@/shared/api/feedback'
import { useAuth } from '@/shared/hooks'

export const useProfileSettings = () => {
  const { user } = useAuth()
  const updateUser = useUpdateUser()
  const uploadAvatar = useUploadUserAvatar()
  const [username, setUsername] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    setUsername(user?.username ?? '')
    setDescription(user?.description ?? '')
  }, [user?.description, user?.username])

  /** Request failures are toasted by the query client's mutation cache. */
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
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

    updateUser.mutate(
      {
        body: {
          description: nextDescription || undefined,
          username: nextUsername,
        },
      },
      { onSuccess: () => showApiSuccessToast('Profile updated') },
    )
  }

  const handleAvatarChange = (file: File | undefined) => {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showApiErrorToast(new Error('Upload a PNG, JPEG, or WebP image.'))
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      showApiErrorToast(new Error('Avatar must be smaller than 2 MB.'))
      return
    }

    uploadAvatar.mutate(file, {
      onSuccess: () => showApiSuccessToast('Avatar updated'),
    })
  }

  return {
    description,
    handleAvatarChange,
    handleSubmit,
    isAvatarPending: uploadAvatar.isPending,
    isUpdatePending: updateUser.isPending,
    setDescription,
    setUsername,
    username,
  }
}
