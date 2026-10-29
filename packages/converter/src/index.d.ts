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

export type {
  CmafFragment,
  CmafRendition,
  ConvertAudioToCmafOptions,
  ConvertAudioToCmafResult,
} from './cmaf'
export { convertAudioToCmaf } from './cmaf'

export type { FfmpegErrorDetails, RunFfmpegOptions, RunFfmpegResult } from './ffmpeg-process'
export { FfmpegError, runFfmpeg } from './ffmpeg-process'
