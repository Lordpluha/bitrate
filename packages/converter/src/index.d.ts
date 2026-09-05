export interface ConvertAudioOptions {
  input: string
  output?: string
  bitrate?: string
  quality?: number
  vbr?: boolean
  application?: 'audio' | 'voip' | 'lowdelay'
  timeoutMs?: number
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

export interface ConvertAudioToHlsOptions {
  input: string
  outputDir: string
  bitrates: string[]
  segmentDuration?: number
  timeoutMs?: number
}

export interface ConvertAudioToHlsResult {
  masterPlaylist: string
  outputDir: string
}

export function convertAudioToHls(
  options: ConvertAudioToHlsOptions,
): Promise<ConvertAudioToHlsResult>

export type {
  CmafFragment,
  CmafRendition,
  ConvertAudioToCmafOptions,
  ConvertAudioToCmafResult,
} from './cmaf'
export { convertAudioToCmaf } from './cmaf'
