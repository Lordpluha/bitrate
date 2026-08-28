'use client'

import { cn } from '@spotify/ui-react'
import { useState } from 'react'
import { useCreateModerationReport } from '@/entities/Moderation'
import { showApiErrorToast, showApiSuccessToast } from '@/shared/api/feedback'
import { Z_INDEX_CLASS } from '@/shared/constants'
import { useOverlayFocus } from '@/shared/hooks/useOverlayFocus'

type ReportPlaylistDialogProps = {
  isOpen: boolean
  onClose: () => void
  playlistId: string
  playlistTitle: string
}

const REPORT_REASONS = [
  'Spam or misleading content',
  'Hateful or abusive content',
  'Sexual or violent content',
  'Copyright concern',
  'Other',
] as const

export const ReportPlaylistDialog = ({
  isOpen,
  onClose,
  playlistId,
  playlistTitle,
}: ReportPlaylistDialogProps) => {
  const [reason, setReason] = useState<(typeof REPORT_REASONS)[number]>(
    REPORT_REASONS[0],
  )
  const [details, setDetails] = useState('')
  const createReport = useCreateModerationReport()
  const dialogRef = useOverlayFocus<HTMLDivElement>({ isOpen, onClose })

  if (!isOpen) return null

  const submitReport = async () => {
    try {
      await createReport.mutateAsync({
        body: {
          details: details.trim() || undefined,
          entityId: playlistId,
          entityType: 'playlist',
          reason,
        },
      })
      showApiSuccessToast(`Report for ${playlistTitle} was submitted`)
      setDetails('')
      onClose()
    } catch (error) {
      showApiErrorToast(error, 'Could not submit report')
    }
  }

  return (
    <div
      className={cn(
        Z_INDEX_CLASS.modal,
        'fixed inset-0 flex items-center justify-center bg-black/70 p-4',
      )}
      ref={dialogRef}
    >
      <button
        aria-label="Close report dialog"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <div
        aria-labelledby="report-playlist-title"
        aria-modal="true"
        className="relative w-full max-w-md rounded-lg bg-popover p-6 shadow-2xl"
        role="dialog"
      >
        <h2 className="text-xl font-bold text-text" id="report-playlist-title">
          Report playlist
        </h2>
        <p className="mt-1 text-sm text-text-subdued">{playlistTitle}</p>

        <label className="mt-5 block text-sm font-semibold text-text">
          Reason
          <select
            className="mt-2 h-11 w-full rounded border border-white/20 bg-surface px-3 text-text outline-none focus:border-white"
            onChange={(event) =>
              setReason(event.target.value as (typeof REPORT_REASONS)[number])
            }
            value={reason}
          >
            {REPORT_REASONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block text-sm font-semibold text-text">
          Details (optional)
          <textarea
            className="mt-2 min-h-28 w-full resize-y rounded border border-white/20 bg-surface p-3 text-text outline-none focus:border-white"
            maxLength={2000}
            onChange={(event) => setDetails(event.target.value)}
            value={details}
          />
        </label>

        <div className="mt-6 flex justify-end gap-3">
          <button
            className="rounded-full px-5 py-2 text-sm font-bold text-text-subdued hover:text-text"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-full bg-text px-5 py-2 text-sm font-bold text-background disabled:opacity-60"
            disabled={createReport.isPending}
            onClick={() => void submitReport()}
            type="button"
          >
            {createReport.isPending ? 'Sending...' : 'Send report'}
          </button>
        </div>
      </div>
    </div>
  )
}
