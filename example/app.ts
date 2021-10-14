import hooh, { createConnections, ConnectionOptions } from '../lib/hooh'
import routes from './routers'


const app = hooh.createApp({
  APP_PATH: __dirname,
  routes,
})

createConnections(hooh.config('orm') || hooh.config('ormconfig') as ConnectionOptions[])

app.listen(8080, () => {
  console.log('应用已经启动，http://localhost:8080')
})
