export interface ConvertAudioToHlsOptions {
  input: string
  outputDir: string
  bitrate: string
  segmentDuration?: number
  timeoutMs?: number
}

export interface ConvertAudioToHlsResult {
  playlist: string
  outputDir: string
}

export function convertAudioToHls(
  options: ConvertAudioToHlsOptions,
): Promise<ConvertAudioToHlsResult>
