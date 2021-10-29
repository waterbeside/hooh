import { Controller } from 'hooh'
class Home extends Controller {
  async index(): Promise<any> {
    return this.ctx.render('home/index', {name: 'HOOH'})
  }
}

export default Home