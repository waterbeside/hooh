import hooh from 'hooh'
import routes from './routers'
import * as typeorm from 'typeorm'

hooh.setOrm(typeorm).createApp({
  APP_PATH: __dirname,
  routes,
}).start()
