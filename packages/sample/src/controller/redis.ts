
import { Controller, helper } from 'hooh'
import { lock } from 'hooh/lib/decorators'
const { sleep } = helper

class Redis extends Controller {
  async index(): Promise<any> {
    // redis get
    await this.redis.set('hooh:testGet', 'test get data')
    const getRes = await this.redis.get('hooh:testGet')

    // extra method: cache
    await this.redis.cache('hooh:testCache', {key: '123'}, 100)
    const cacheRes = await this.redis.cache('hooh:testCache')

    const returnData = {
      getRes,
      cacheRes,
    }

    this.ctx.apiReturn(0, returnData)
  }

  @lock('testLock:data_${data}', { ex: 10, loop: 5 })
  async lockit(): Promise<any> {
    this.ctx.body = 'koa ok!'
    await sleep(2000)
  }
}

export default Redis