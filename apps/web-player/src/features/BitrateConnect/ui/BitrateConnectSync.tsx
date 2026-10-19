'use client'

import { useBitrateConnectSync } from '../model/useBitrateConnectSync'

/** Mount once in the signed-in shell; renders nothing. */
export const BitrateConnectSync = () => {
  useBitrateConnectSync()
  return null
}
