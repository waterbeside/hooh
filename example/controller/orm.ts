
import { Controller } from '../../lib/hooh'
import { getConnection } from 'typeorm'
import { User } from '../entity/site/user'
class Home extends Controller {
  async index(): Promise<any> {
    const connection = await getConnection('site') 
    const allData = await connection.getRepository(User).createQueryBuilder('user').select().where('user.id < 100').getMany()
    this.ctx.apiReturn(0, {message: 'Welcome to use Hooh', allData})
  }
}

export default Home