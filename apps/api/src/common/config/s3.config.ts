import { registerAs } from '@nestjs/config'

/** The s3 config value. */
export const s3Config = registerAs('s3', () => ({
  endpoint: process.env.S3_ENDPOINT as string,
  region: process.env.S3_REGION ?? 'us-east-1',
  bucket: process.env.S3_BUCKET as string,
  accessKey: process.env.S3_ACCESS_KEY as string,
  secretKey: process.env.S3_SECRET_KEY as string,
  publicUrl: process.env.S3_PUBLIC_URL,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
}))
