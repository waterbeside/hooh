
import { Controller } from 'hooh'
import { User } from '../entity/user'
class OrmSample extends Controller {
  async index(): Promise<any> {
    const allData = await this.orm.getRepository(User).createQueryBuilder('user').select().where('user.id < 100').getMany()
    this.ctx.apiReturn(0, {message: 'Welcome to use Hooh', allData})
  }
}

export default OrmSample