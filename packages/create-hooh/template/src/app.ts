import hooh from 'hooh'
import routes from './routes'

hooh.createApp({
  APP_PATH: __dirname,
  routes,
})
  .scheduleStart() // 启动定时任务
  .start() // 启动服务
