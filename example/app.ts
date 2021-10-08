import koaok from '../lib/koaok'
import routes from './routers'
import path from 'path'

const app = koaok.createApp({
  APP_PATH: __dirname,
  routes,
})

app.listen(3003, () => {
  console.log('应用已经启动，http://localhost:3003')
})
