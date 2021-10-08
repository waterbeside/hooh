import koaok, { App } from '../koaok'
import Redis from '../extend/redis'
import { RedisOptions } from 'ioredis'

export { Redis, RedisOptions };



export async function loadRedis(): Promise<void> {
  const redisConfig = koaok.config<RedisOptions>('redis') || null
  if (!redisConfig) {
    return
  }
  const defaultConfig = {
    port: 6379,
    host: '127.0.0.1',
    family: 4,
  }
  const setting: RedisOptions = Object.assign({}, defaultConfig, redisConfig)

  koaok.redis = new Redis(setting)
  
}