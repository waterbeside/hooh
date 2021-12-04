import hooh, { Controller } from 'hooh'
class TestCron extends Controller {
  async index(): Promise<any> {
    hooh.logger.info('定时任务示例')
    console.log('test cron')
  }
}

export default TestCron