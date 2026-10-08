import { join } from 'node:path'
import * as dotenv from 'dotenv'
import './s3-env-defaults'

// Artist registration answers 503 when no verification mail can be delivered; e2e has no SMTP.
process.env.DEV_MAIL_LOG_TOKENS ??= 'true'

dotenv.config({ path: join(__dirname, '..', '.env.test') })
