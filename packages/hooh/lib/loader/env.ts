import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import hooh from '../hooh'

export function loadEnv(): typeof process.env {
  const nodeEnv = hooh.options.env || (process.env.NODE_ENV ?  process.env.NODE_ENV.trim() : 'production')
  process.env.NODE_ENV = nodeEnv

  dotenv.config({ path: path.join(process.cwd(), '.env') })
  try {
    const envConfig = dotenv.parse(fs.readFileSync(path.join(process.cwd(), `.env.${nodeEnv}`)))
    for (const k in envConfig) {
      process.env[k] = envConfig[k]
    }
  } catch (error: any) {
    // PASS
  }
  return process.env
}

