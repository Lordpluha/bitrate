import { join } from 'node:path'
import * as dotenv from 'dotenv'
import './s3-env-defaults'

dotenv.config({ path: join(__dirname, '..', '.env.test') })
