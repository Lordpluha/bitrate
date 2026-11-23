import type { CmafRendition } from './cmaf'

/** How a rendition is encrypted (ADR-0077): CENC `cbcs` under one key per track. */
export interface CmafEncryption {
  scheme: 'cbcs'
  /** 128-bit key id, lowercase hex. */
  keyId: string
}

export interface EncryptedCmafRendition extends CmafRendition {
  /** `null` for a clear copy requested through `clearBitrates`. */
  encryption: CmafEncryption | null
}

export interface EncryptCmafRenditionsOptions {
  /** The clear renditions `convertAudioToCmaf` produced. */
  renditions: Pick<CmafRendition, 'bitrate' | 'path'>[]
  outputDir: string
  /** 128-bit key id, lowercase hex. */
  keyId: string
  /** 128-bit content key, lowercase hex. */
  key: string
  /** Bitrates also packaged unencrypted, on the same fragment grid. */
  clearBitrates?: number[]
  fragmentFrames?: number
  timeoutMs?: number
  onLog?: (message: string) => void
}

export interface EncryptCmafRenditionsResult {
  outputDir: string
  timescale: number
  durationTicks: number
  renditions: EncryptedCmafRendition[]
}

export function encryptCmafRenditions(
  options: EncryptCmafRenditionsOptions,
): Promise<EncryptCmafRenditionsResult>
