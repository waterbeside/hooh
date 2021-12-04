import hooh from '../hooh'
import log4js, { Configuration } from 'log4js'


export async function loadLogger(): Promise<void> {
  const loggerConfig = hooh.config<Configuration>('logger') || null
  if (!loggerConfig) {
    return
  }
  log4js.configure(loggerConfig)
  // hooh.logger = log4js.getLogger('default')
}