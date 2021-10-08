
import Controller from '../../lib/controller';

class Home extends Controller {
  async index(): Promise<any> {
    this.ctx.apiReturn(0, {message: 'Welcome to use Koaok'})
  }
}

export default Home