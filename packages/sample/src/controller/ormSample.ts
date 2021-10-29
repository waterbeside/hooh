
import { Controller  } from 'hooh'

import { User } from '../entity/site/user'
class Orm extends Controller {
  async index(): Promise<any> {
    const rows = await this.orm.getRepository(User, 'default').createQueryBuilder('user').select().where('user.id < 100').getMany()
    this.ctx.apiReturn(0, {rows})
  }
}

export default Orm