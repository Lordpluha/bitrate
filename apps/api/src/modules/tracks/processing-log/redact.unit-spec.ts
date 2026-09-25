import { describe, expect, it } from '@jest/globals'
import { redactProcessingText } from './redact'

describe('redactProcessingText', () => {
  it('collapses an absolute path through a tracks/ segment', () => {
    const result = redactProcessingText(
      'Input file not found: /storage/private/tracks/track-1/generations/abc/hls/master.m3u8',
      { keep: 'head', maxBytes: 1_024 },
    )

    expect(result).toBe('Input file not found: <tracks>/track-1/generations/abc/hls/master.m3u8')
  })

  it('collapses an absolute path through a .processing/ temp-dir segment', () => {
    const result = redactProcessingText(
      'Converted audio file is empty: /storage/.processing/track-1-job-1-1/audio_128k.opus',
      { keep: 'head', maxBytes: 1_024 },
    )

    expect(result).toBe('Converted audio file is empty: <tracks>/track-1-job-1-1/audio_128k.opus')
  })

  it('redacts a presigned URL carrying an X-Amz-Signature query', () => {
    const url =
      'https://bucket.s3.amazonaws.com/tracks/track-1/audio.opus?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=deadbeef'
    const result = redactProcessingText(`upload failed for ${url}`, {
      keep: 'head',
      maxBytes: 1_024,
    })

    expect(result).toBe('upload failed for <presigned-url host>')
  })

  it('redacts a presigned URL carrying a plain Signature query', () => {
    const url = 'https://cdn.example.com/audio.opus?Expires=1&Signature=abc123&Key-Pair-Id=xyz'
    const result = redactProcessingText(url, { keep: 'head', maxBytes: 1_024 })

    expect(result).toBe('<presigned-url host>')
  })

  it('leaves an ordinary URL with no presigned markers untouched', () => {
    const url = 'https://example.com/docs/ffmpeg'
    const result = redactProcessingText(`see ${url}`, { keep: 'head', maxBytes: 1_024 })

    expect(result).toBe(`see ${url}`)
  })

  it('masks a secret-shaped KEY=value pair', () => {
    const result = redactProcessingText(
      'AWS_SECRET_ACCESS_KEY=abcd1234 S3_BUCKET=tracks OTHER=fine',
      { keep: 'head', maxBytes: 1_024 },
    )

    expect(result).toBe('AWS_SECRET_ACCESS_KEY=<redacted> S3_BUCKET=<redacted> OTHER=fine')
  })

  it('truncates to maxBytes keeping the head when requested', () => {
    const text = 'a'.repeat(100)
    const result = redactProcessingText(text, { keep: 'head', maxBytes: 10 })

    expect(result).toBe('a'.repeat(10))
  })

  it('truncates to maxBytes keeping the tail when requested', () => {
    const text = `${'a'.repeat(90)}${'b'.repeat(10)}`
    const result = redactProcessingText(text, { keep: 'tail', maxBytes: 10 })

    expect(result).toBe('b'.repeat(10))
  })

  it('leaves text under the byte limit untouched', () => {
    const result = redactProcessingText('short message', { keep: 'head', maxBytes: 1_024 })

    expect(result).toBe('short message')
  })

  it('is idempotent — redacting an already-redacted string changes nothing further', () => {
    const once = redactProcessingText(
      '/storage/tracks/track-1/audio.opus AWS_SECRET_ACCESS_KEY=abcd',
      { keep: 'head', maxBytes: 1_024 },
    )
    const twice = redactProcessingText(once, { keep: 'head', maxBytes: 1_024 })

    expect(twice).toBe(once)
  })
})
