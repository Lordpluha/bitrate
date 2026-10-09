import {
  removeCover,
  removeTrack,
  renameTrack,
  uploadCover,
  uploadTrack,
} from './media'
import { useReleaseWrite } from './useReleaseRights'

export const useUploadCover = (artistId: string) =>
  useReleaseWrite(artistId, uploadCover)
export const useRemoveCover = (artistId: string) =>
  useReleaseWrite(artistId, removeCover)
export const useUploadTrack = (artistId: string) =>
  useReleaseWrite(artistId, uploadTrack)
export const useRemoveTrack = (artistId: string) =>
  useReleaseWrite(artistId, removeTrack)
export const useRenameTrack = (artistId: string) =>
  useReleaseWrite(artistId, renameTrack)
