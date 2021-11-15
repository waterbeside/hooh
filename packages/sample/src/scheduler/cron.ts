import { Controller } from 'hooh'
class Cron extends Controller {
  async index(): Promise<any> {
    console.log('test cron')
  }
}

export default Cron