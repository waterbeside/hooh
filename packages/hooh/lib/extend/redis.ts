import IORedis,  { RedisOptions } from 'ioredis'
import dayjs from 'dayjs'
import { sleep } from '../helper'

export interface LockOptions {
  ex?: number
  loop?: number
  wait?: number
}
export default class Redis extends IORedis {

  emptySign = '__empty__'


  constructor(setting: RedisOptions) {
    super(setting)
  }


  /**
   * 通用的缓存方法
   *
   * @param {string} cacheKey 缓存key
   * @param {any} value 要缓存的值
   * @param {number} ex  有效时长 (秒) 当大于-1时才设置有效时
   * @return {Promise<any>}
   */
  async cache(cacheKey: string, value: any = false, ex = -1): Promise<any> {
    let res = true
    if (value === null) {
      this.del(cacheKey)
    } else if (value !== false) {
      value = this.formatValue(value)
      if (ex > -1) {
        this.setex(cacheKey, ex, value)
      } else {
        this.set(cacheKey, value)
      }
    } else {
      const str = await this.get(cacheKey)
      res = this.formatRes(str)
    }
    return res
  }

  /**
   * set前数据处理
   *
   * @param {any} value 值
   * @return {string}
   */
  formatValue(value: any): string {
    value = typeof value === 'string' ? value : JSON.stringify(value)
    return value
  }

  /**
   * get后数据处理
   *
   * @param {any} res value
   * @param {integer} type 0处理单条，1处理列表
   * @return {any}
   */
  formatRes(res: any, type = 0): any {
    if (res === null || res === false) {
      return res
    }
    if (type > 0 && res instanceof Array) {
      const newRes = []
      for (const i in res) {
        if (res[i]) {
          const item = this.formatRes(res[i], 0)
          newRes.push(item)
        }
      }
      return newRes
    } else {
      let resData = res
      try {
        resData = JSON.parse(res)
      } catch (err) {
        resData = res
      }
      return resData
    }
  }
  
  

  /**
   * 加锁
   *
   * @param {string} lockKey cache key
   * @param {LockOptions} lockOption 设置 
   * @return {Promise<boolean>}
   */
  async lock(lockKey: string, lockOption: LockOptions | null = null): Promise<boolean> {
    const defaultOpt = {
      ex: 2,
      loop: 50,
      wait: 20
    }
    const opt = {...defaultOpt, ...lockOption}
    if (opt.loop < 1) {
      return false
    }
    let lock = false
    const cacheKey = `_lock:${lockKey}`

    // 获取锁
    const now = parseInt(dayjs().format('X'), 10)
    const expires = now + opt.ex + 1
    lock = (await this.set(cacheKey, expires, ['ex', opt.ex, 'nx'])) ? true : false

    if (!lock) {
      // 如果取不到锁
      let lockData = await this.cache(cacheKey)
      lockData = parseInt(lockData, 10)
      if (now > lockData) { // 检查锁过期没
        await this.unlock(lockKey)
        lock = await this.lock(lockKey, opt)
      }
    }
    if (!lock) {
      // 休眠20毫秒
      await sleep(opt.wait)
      opt.loop = opt.loop - 1 || 0
      lock = await this.lock(lockKey, opt)
    }
    // 返回锁
    return lock
  }

  /**
   * 释放锁。
   */
  async unlock(lockKey: string) {
    const cacheKey = `_lock:${lockKey}`
    const res = await this.del(cacheKey)
    return res
  }



} 
