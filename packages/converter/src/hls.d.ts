export interface ConvertAudioToHlsOptions {
  input: string
  outputDir: string
  bitrates: string[]
  segmentDuration?: number
  timeoutMs?: number
  onLog?: (message: string) => void
}

export interface ConvertAudioToHlsResult {
  masterPlaylist: string
  outputDir: string
}

export function convertAudioToHls(
  options: ConvertAudioToHlsOptions,
): Promise<ConvertAudioToHlsResult>
