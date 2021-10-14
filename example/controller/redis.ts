
import hooh, { Controller } from '../../lib/hooh';
import { lock } from '../../lib/decorators'
import { sleep } from '../../lib/helper/index';

class Home extends Controller {
  async index(): Promise<any> {
    // redis get
    await hooh.redis.set('hooh:testGet', 'test get data')
    const getRes = await hooh.redis.get('hooh:testGet')

    // extra method: cache
    await hooh.redis.cache('hooh:testCache', {key: '123'}, 100)
    const cacheRes = await hooh.redis.cache('hooh:testCache')

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

export default Home