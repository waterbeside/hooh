import koaok, { createConnections, ConnectionOptions } from '../lib/koaok'
import routes from './routers'


const app = koaok.createApp({
  APP_PATH: __dirname,
  routes,
})

createConnections(koaok.config('orm') || koaok.config('ormconfig') as ConnectionOptions[])

app.listen(8080, () => {
  console.log('应用已经启动，http://localhost:8080')
})
