import hooh, { Context, helper } from '../hooh'

/**
 * 
 * @param cacheKey key 如'keyName:${paramName}}',可通过请求参数替换其${paramName}的内容
 * @param ex 过期时间，默认5分钟
 */
export function apiCache(cacheKey: string, ex = 0) {

  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    const _value = descriptor.value
    ex = ex || 60 * 5
    if (typeof _value === 'function') {
      descriptor.value = async function(this: any, ...args: any[]) {
        if (!hooh.redis) {
          throw new Error('Use "apiCache decorators" must load redis first')
        }
        const ctx = this.ctx as Context
        const params = ctx.input()
        let cacheKeyReplaced = helper.replaceTemplateStr(cacheKey, params)
        if (cacheKeyReplaced === cacheKey) {
          cacheKeyReplaced = cacheKey+':'+helper.md5(params)
        }
        const cacheData = await hooh.redis.cache(cacheKeyReplaced)
        if (cacheData) {
          return ctx.json(cacheData)
        }

        const res = await _value.apply(this, args)
        if (ctx.body) {
          await hooh.redis.cache(cacheKeyReplaced, ctx.body, ex)
        }
        return res
      }
    }
    return descriptor
  }
}