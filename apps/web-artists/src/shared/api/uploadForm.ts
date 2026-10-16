import { apiBaseUrl, refreshToken } from './fetchClient'

export interface UploadResponse {
  status: number
  ok: boolean
  data: unknown
}

export interface UploadFormOptions {
  method: 'POST' | 'PUT'
  path: string
  form: FormData
  /** Fraction of the request body sent so far, 0–1. */
  onProgress?: (fraction: number) => void
  signal?: AbortSignal
}

/**
 * Sends multipart form data with upload progress, which `fetch` cannot report. A 401 rotates
 * the session once and repeats the upload, matching the JSON client's refresh behaviour.
 * Network failures and aborts reject; HTTP errors resolve so callers map them to messages.
 */
export async function uploadForm(
  options: UploadFormOptions,
): Promise<UploadResponse> {
  const first = await send(options)
  if (first.status !== 401) return first
  if (!(await refreshToken())) return first
  options.onProgress?.(0)
  return send(options)
}

function send({
  method,
  path,
  form,
  onProgress,
  signal,
}: UploadFormOptions): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open(method, `${apiBaseUrl}${path}`)
    request.withCredentials = true
    request.responseType = 'json'
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total)
    }
    request.onload = () =>
      resolve({
        status: request.status,
        ok: request.status >= 200 && request.status < 300,
        data: request.response,
      })
    request.onerror = () => reject(new Error('Upload failed'))
    request.onabort = () => reject(new Error('Upload cancelled'))
    if (signal) {
      if (signal.aborted) {
        reject(new Error('Upload cancelled'))
        return
      }
      signal.addEventListener('abort', () => request.abort(), { once: true })
    }
    request.send(form)
  })
}
