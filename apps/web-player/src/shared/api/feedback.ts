'use client'

import { toast } from '@bitrate/ui-react'
import { ApiRequestError, getApiErrorStatus } from './errors'

const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.'

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Check the entered data and try again.',
  401: 'Your session has expired. Please log in again.',
  403: 'You do not have permission to do this.',
  404: 'The requested item was not found.',
  409: 'This action conflicts with existing data.',
  422: 'Some fields are invalid. Please check the form.',
  429: 'Too many requests. Please wait a bit and try again.',
  500: 'The server is temporarily unavailable. Please try again later.',
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const getMessageFromUnknown = (value: unknown): string | null => {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    const messages = value
      .map((item) => getMessageFromUnknown(item))
      .filter((item): item is string => Boolean(item))

    return messages.length > 0 ? messages.join(', ') : null
  }

  if (!isRecord(value)) return null

  const message = getMessageFromUnknown(value.message)
  if (message) return message

  return getMessageFromUnknown(value.error)
}

const isNetworkError = (error: unknown) =>
  error instanceof TypeError &&
  error.message.toLowerCase().includes('failed to fetch')

export const getApiErrorMessage = (
  error: unknown,
  fallback = DEFAULT_ERROR_MESSAGE,
) => {
  if (isNetworkError(error)) {
    return 'Cannot connect to the server. Please check your connection and try again.'
  }

  if (error instanceof ApiRequestError) {
    return STATUS_MESSAGES[error.status] ?? error.message
  }

  const message = getMessageFromUnknown(error)
  if (message) return message

  if (error instanceof Error && error.message) return error.message

  return fallback
}

export const showApiErrorToast = (
  error: unknown,
  fallback = DEFAULT_ERROR_MESSAGE,
) => {
  const message = getApiErrorMessage(error, fallback)

  if (getApiErrorStatus(error) === 429) {
    toast.error(message, { id: 'api-rate-limit-error' })
    return
  }

  toast.error(message)
}

export const showApiSuccessToast = (message: string) => {
  toast.success(message)
}
