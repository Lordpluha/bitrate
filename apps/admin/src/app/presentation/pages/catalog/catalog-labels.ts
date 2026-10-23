import type { TrackProcessingStatus } from '@domain/track'

/** The pill each pipeline state wears — the catalog list and the track page agree. */
export const PIPELINE_BADGE: Record<TrackProcessingStatus, 'success' | 'info' | 'destructive'> = {
  READY: 'success',
  PROCESSING: 'info',
  FAILED: 'destructive',
}

export const PIPELINE_KEY: Record<TrackProcessingStatus, string> = {
  READY: 'catalog.pipeline.READY',
  PROCESSING: 'catalog.pipeline.PROCESSING',
  FAILED: 'catalog.pipeline.FAILED',
}
