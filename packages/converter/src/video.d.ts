export interface ConvertVideoOptions {
  input: string
  output?: string
  bitrate?: string
  quality?: number
  profile?: 'aac_low' | 'aac_he' | 'aac_he_v2'
}

export interface ConvertVideoResult {
  input: string
  output: string
  inputSize: string
  outputSize: string
}

export function convertVideo(options: ConvertVideoOptions): Promise<ConvertVideoResult>
