
import { Controller } from '../../lib/koaok';
import { getConnection } from 'typeorm';
import { User } from '../entity/koaoksite/user';
class Home extends Controller {
  async index(): Promise<any> {
    const connection = await getConnection('koaoksite') 
    const allData = await connection.getRepository(User).createQueryBuilder('user').select().where('user.id < 100').getMany()
    this.ctx.apiReturn(0, {message: 'Welcome to use Koaok', allData})
  }
}

export default Home