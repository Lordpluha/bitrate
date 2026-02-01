export interface ConvertAudioOptions {
  input: string
  output?: string
  bitrate?: string
  quality?: number
  vbr?: boolean
  application?: 'audio' | 'voip' | 'lowdelay'
}

export interface ConvertAudioResult {
  input: string
  output: string
  inputSize: string
  outputSize: string
}

export function convertAudio(options: ConvertAudioOptions): Promise<ConvertAudioResult>

export interface ConvertImageOptions {
  input: string
  output?: string
  quality?: number
  lossless?: boolean
}

export interface ConvertImageResult {
  input: string
  output: string
  inputSize: string
  outputSize: string
}

export function convertImage(options: ConvertImageOptions): Promise<ConvertImageResult>
