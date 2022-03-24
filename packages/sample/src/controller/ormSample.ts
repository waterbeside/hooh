
import { Controller  } from 'hooh'
import { User } from '../entity/site/user'

class Orm extends Controller {
  async index(): Promise<any> {
    const connName = 'default'
    const userRepository = this.orm.getRepository(User, connName)
    // orm一般用法
    const rows = await userRepository.findByIds([1, 2, 3])
    // 使用queryBuilder
    const rows2 = await userRepository.createQueryBuilder('user').select().where('user.id < 100').getMany()
    // 直接sql语句查询
    const sql = 'select * from user where id < 100'
    const rows3 = await this.orm.getManager(connName).query(sql)
    // 输出
    this.ctx.apiReturn(0, {rows, rows2, rows3})
  }
}

export default Orm