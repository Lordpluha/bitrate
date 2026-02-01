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
