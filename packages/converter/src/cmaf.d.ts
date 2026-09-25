export interface CmafFragment {
  startTicks: number
  durationTicks: number
  offset: number
  length: number
}

export interface CmafRendition {
  bitrate: number
  path: string
  size: number
  initRange: [number, number]
  indexRange: [number, number]
  fragments: CmafFragment[]
}

export interface ConvertAudioToCmafOptions {
  input: string
  outputDir: string
  bitrates: number[]
  fragmentFrames?: number
  timeoutMs?: number
  onLog?: (message: string) => void
}

export interface ConvertAudioToCmafResult {
  outputDir: string
  timescale: number
  durationTicks: number
  renditions: CmafRendition[]
}

export function convertAudioToCmaf(
  options: ConvertAudioToCmafOptions,
): Promise<ConvertAudioToCmafResult>
