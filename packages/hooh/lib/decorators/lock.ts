import hooh, { Context, helper } from '../hooh'


interface LockOptions {
  ex?: number
  loop?: number
  wait?: number
  lockReturn?: 'json' | 'error'
  errorCode?: number
  statusCode?: number
}


/**
 * 
 * @param lockKey key 如'keyName:${paramName}}',可通过请求参数替换其${paramName}的内容
 * @param lockOption 配置项 { ex: lock自动解锁前的时长（s）, loop: 取不到销时的循环次数, wait:每次循环的等待时间(ms)} 
 */
export function lock(lockKey: string, lockOption: LockOptions | null = null) {
  const defaultOpt = {
    ex: 2,
    loop: 50,
    wait: 20,
    lockReturn: 'json',
    errorCode: hooh.config('lockedErrorCode') || -1,
    statusCode: 500
  }
  const opt = {...defaultOpt, ...lockOption}
  
  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    const _value = descriptor.value
    if (typeof _value === 'function') {
      descriptor.value = async function(this: any, ...args: any[]) {
        if (!hooh.redis) {
          throw new Error('Use "lock decorators" must load redis first')
        }
        const ctx = this.ctx as Context
        const params = this.ctx.input()
        lockKey = helper.replaceTemplateStr(lockKey, params)
        const lockRes = await hooh.redis.lock(lockKey, opt)
        if (!lockRes) {
          if (opt.lockReturn === 'json') {
            return ctx.apiReturn(opt.errorCode as number, 'Locked!')
          } else {
            throw new Error
          }
        }
        const res = await _value.apply(this, args)
        await hooh.redis.unlock(lockKey)
        return res
      }
    }
    return descriptor
  }
}