import hooh from 'hooh'
import routes from './routers'

hooh.createApp({
  APP_PATH: __dirname,
  routes,
}).start()
