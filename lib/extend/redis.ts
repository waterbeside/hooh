import IORedis,  { RedisOptions } from 'ioredis'


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
  

} 