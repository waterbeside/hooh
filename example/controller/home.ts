import { Controller } from '../../lib/hooh';
class Home extends Controller {
  async index(): Promise<any> {
    this.ctx.apiReturn(0, {message: 'Welcome to use Hooh'})
  }
}

export default Home