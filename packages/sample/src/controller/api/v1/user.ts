import { Controller } from 'hooh'


class User extends Controller {
  async index(): Promise<any> {
    this.ctx.body = 'this is a auto router. no router setting!!!!'
  }

}

export default User