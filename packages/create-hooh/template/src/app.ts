import hooh from 'hooh'
import routes from './routes'

hooh.createApp({
  APP_PATH: __dirname,
  routes,
}).start()
