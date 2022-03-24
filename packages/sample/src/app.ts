import hooh from 'hooh'
import routes from './routes'
import * as typeorm from 'typeorm'

hooh.setOrm(typeorm).createApp({
  APP_PATH: __dirname,
  routes,
}).scheduleStart().start()
