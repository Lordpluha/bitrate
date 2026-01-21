'use client'

import { useRef, useCallback, useEffect } from 'react'

interface ProgressiveStreamingOptions {
  chunkSize?: number // Size of each chunk in bytes
  bufferAhead?: number // How many seconds to buffer ahead
}

export const useProgressiveAudioStreaming = (
  audioElement: HTMLAudioElement | null,
  trackUrl: string | null,
  options: ProgressiveStreamingOptions = {}
) => {
  const {
    chunkSize = 256 * 1024, // 256KB chunks like Spotify
    bufferAhead = 30 // Buffer 30 seconds ahead
  } = options

  const mediaSourceRef = useRef<MediaSource | null>(null)
  const sourceBufferRef = useRef<SourceBuffer | null>(null)
  const fetchControllerRef = useRef<AbortController | null>(null)
  const currentPositionRef = useRef(0)
  const fileSizeRef = useRef(0)
  const isStreamingRef = useRef(false)

  const stopStreaming = useCallback(() => {
    isStreamingRef.current = false
    
    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort()
      fetchControllerRef.current = null
    }

    if (mediaSourceRef.current?.readyState === 'open') {
      try {
        mediaSourceRef.current.endOfStream()
      } catch (e) {
        console.warn('Error ending stream:', e)
      }
    }

    currentPositionRef.current = 0
  }, [])

  const fetchChunk = useCallback(async (start: number, end: number, signal: AbortSignal) => {
    if (!trackUrl) return null

    try {
      console.log(`Fetching chunk: bytes ${start}-${end}`)
      
      const response = await fetch(trackUrl, {
        headers: {
          'Range': `bytes=${start}-${end}`
        },
        credentials: 'include',
        signal
      })

      if (!response.ok && response.status !== 206) {
        throw new Error(`HTTP ${response.status}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      console.log(`✓ Chunk loaded: ${arrayBuffer.byteLength} bytes`)
      
      return arrayBuffer
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Chunk fetch aborted')
      } else {
        console.error('Error fetching chunk:', error)
      }
      return null
    }
  }, [trackUrl])

  const appendChunk = useCallback(async (chunk: ArrayBuffer) => {
    const sourceBuffer = sourceBufferRef.current
    if (!sourceBuffer || sourceBuffer.updating) {
      return false
    }

    return new Promise<boolean>((resolve) => {
      const onUpdateEnd = () => {
        sourceBuffer.removeEventListener('updateend', onUpdateEnd)
        resolve(true)
      }

      const onError = () => {
        sourceBuffer.removeEventListener('error', onError)
        console.error('SourceBuffer error')
        resolve(false)
      }

      sourceBuffer.addEventListener('updateend', onUpdateEnd)
      sourceBuffer.addEventListener('error', onError)

      try {
        sourceBuffer.appendBuffer(chunk)
      } catch (e) {
        console.error('Error appending buffer:', e)
        sourceBuffer.removeEventListener('updateend', onUpdateEnd)
        sourceBuffer.removeEventListener('error', onError)
        resolve(false)
      }
    })
  }, [])

  const streamChunks = useCallback(async () => {
    if (!audioElement || !trackUrl || !sourceBufferRef.current) return

    isStreamingRef.current = true
    fetchControllerRef.current = new AbortController()

    while (isStreamingRef.current && currentPositionRef.current < fileSizeRef.current) {
      // Check if we need more buffering
      const currentTime = audioElement.currentTime
      const buffered = audioElement.buffered
      
      let bufferedEnd = 0
      if (buffered.length > 0) {
        bufferedEnd = buffered.end(buffered.length - 1)
      }

      // If we have enough buffer ahead, wait
      if (bufferedEnd > currentTime + bufferAhead) {
        console.log(`Buffer sufficient: ${bufferedEnd.toFixed(1)}s buffered, current: ${currentTime.toFixed(1)}s`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        continue
      }

      // Fetch next chunk
      const start = currentPositionRef.current
      const end = Math.min(start + chunkSize - 1, fileSizeRef.current - 1)

      const chunk = await fetchChunk(start, end, fetchControllerRef.current.signal)
      
      if (!chunk || !isStreamingRef.current) break

      const success = await appendChunk(chunk)
      
      if (success) {
        currentPositionRef.current = end + 1
      } else {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    console.log('Streaming completed')
    isStreamingRef.current = false
  }, [audioElement, trackUrl, chunkSize, bufferAhead, fetchChunk, appendChunk])

  const startStreaming = useCallback(async () => {
    if (!audioElement || !trackUrl) return

    try {
      console.log('Starting progressive streaming for:', trackUrl)

      // Get file size first
      const headResponse = await fetch(trackUrl, {
        method: 'HEAD',
        credentials: 'include'
      })

      const contentLength = headResponse.headers.get('content-length')
      fileSizeRef.current = contentLength ? parseInt(contentLength) : 0

      if (fileSizeRef.current === 0) {
        console.error('Could not determine file size')
        return
      }

      console.log(`File size: ${fileSizeRef.current} bytes`)

      // Create MediaSource
      if (!MediaSource.isTypeSupported('audio/mpeg')) {
        console.error('audio/mpeg is not supported')
        return
      }

      const mediaSource = new MediaSource()
      mediaSourceRef.current = mediaSource

      mediaSource.addEventListener('sourceopen', async () => {
        console.log('MediaSource opened')

        try {
          const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg')
          sourceBufferRef.current = sourceBuffer
          
          currentPositionRef.current = 0
          
          // Start streaming chunks
          streamChunks()
        } catch (e) {
          console.error('Error setting up SourceBuffer:', e)
        }
      })

      audioElement.src = URL.createObjectURL(mediaSource)
      
    } catch (error) {
      console.error('Error starting streaming:', error)
    }
  }, [audioElement, trackUrl, streamChunks])

  // Cleanup on unmount or track change
  useEffect(() => {
    return () => {
      stopStreaming()
    }
  }, [stopStreaming])

  return {
    startStreaming,
    stopStreaming,
    isStreaming: isStreamingRef.current
  }
}
