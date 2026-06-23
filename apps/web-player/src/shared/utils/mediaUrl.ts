export const getApiBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? ''

export const getApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${getApiBaseUrl()}${normalizedPath}`
}

export const getStaticMediaUrl = (
  value: string | null | undefined,
  folder: string,
  fallback: string,
) => {
  if (!value) return fallback

  if (value.startsWith('http') || value.startsWith('/images/')) {
    return value
  }

  if (value.startsWith('/static/')) {
    return getApiUrl(value)
  }

  return getApiUrl(`/static/${folder}/${value}`)
}
