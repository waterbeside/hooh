import path from 'path'
import Koa from 'koa'
import Controller from './controller'
import Logic from './logic'
import { TApiReturn, TCtxInput } from './extend/context'
import configLoader, { LoadConfigRes } from './loader/config'
import { loadRoutes } from './loader/routes'
import { loadSchedule } from './loader/schedule'
import { loadExtends } from './loader/extends'
import { loadEnv } from './loader/env'
import { Redis, loadRedis } from './loader/redis'
import bodyParser from 'koa-bodyparser'
import Router from 'koa-router'
import { getConnection, createOrmConnections, OrmConnectionOptions } from './ormConnections'
import { Context, Next } from 'koa'
import * as helper from './helper'
import * as decorators from './decorators'
import * as oTypeorm from 'typeorm'
import schedule from 'node-schedule'
import { loadLogger } from './loader/logger'
import log4js, { Logger } from 'log4js'

type methodType = 'get'|'post'|'all'|'put'|'link'|'unlink'|'delete'|'del'|'head'|'options'|'patch'

export interface RouteConfigItem {
  match: string
  method?:  methodType
  controller: string
  middlewares?: Koa.Middleware[]
}

export interface ScheduleConfigItem {
  enable: boolean
  cron: string
  handle: string
  immediate?: boolean
  appInstance?: number[] | number
}

export type RouteConfig = RouteConfigItem[]
export type ScheduleConfig = ScheduleConfigItem[]

interface CreateAppOptions {
  APP_PATH?: string
  APP_CONTROLLER_PATH?: string
  APP_SCHEDULE_PATH?: string
  routes?: RouteConfig
  middlewares?: Koa.Middleware[]
  env?: string
  [key:string]: any
}

declare module 'koa' {
  interface DefaultContext {
    hooh: Hooh
    json: (data: any) => void
    apiReturn: TApiReturn
    input: TCtxInput
  }
}


export interface App extends Koa { 
  hooh: Hooh
}


export interface Hooh {
  app?: App
  _config: LoadConfigRes
  options: CreateAppOptions
  env: typeof process.env
  createApp: (opt: CreateAppOptions) => Hooh
  config: <T>(name: string) => T | undefined
  Controller: typeof Controller
  Logic: typeof Logic
  redis: Redis
  controller?: Controller
  router: Router
  start: (port?: null | number | string)=>Hooh
  orm: typeof oTypeorm
  setOrm: (orm: typeof oTypeorm) => Hooh
  scheduleStart: () => Hooh
  scheduleJobs: {
    [props:string]: schedule.Job
  }
  logger: Logger
  getLogger: (category: string) => Logger
}


export const router = new Router

function createControllerPath (appPath: string): string {
  return path.join(appPath, 'controller')
}

function createSchedulePath (appPath: string): string {
  return path.join(appPath, 'scheduler')
}

let isOrmSet = false


const hooh:Hooh = {
  _config: {},
  Controller,
  Logic,
  env: {},
  router,
  redis: {} as Redis,
  orm: oTypeorm,
  logger: log4js.getLogger('default'),
  getLogger: log4js.getLogger,
  options:(()=>{
    const appPath = path.join(process.cwd(), 'src')
    const appControllerPath = createControllerPath(appPath)
    const appSchedulePath = createSchedulePath(appPath)
    return {
      APP_PATH: appPath,
      APP_CONTROLLER_PATH: appControllerPath,
      APP_SCHEDULE_PATH: appSchedulePath
    }
  })(),
  createApp: function(opt:CreateAppOptions) {

    if (this.app) return this
    const options = {
      ...this.options, ...opt
    }
    if (!opt.APP_CONTROLLER_PATH) {
      options.APP_CONTROLLER_PATH = createControllerPath(options.APP_PATH as string)
    }
    if (!opt.APP_SCHEDULE_PATH) {
      options.APP_SCHEDULE_PATH = createSchedulePath(options.APP_PATH as string)
    }
    this.options = options
    this.env = loadEnv()
    const app = new Koa() as App
    app.hooh = hooh
    app.use(bodyParser())
    if (this.options.middlewares && this.options.middlewares.length > 0) {
      this.options.middlewares.forEach((item) => {
        app.use(item)
      })
    }

    // 加载config
    this._config = configLoader.loadConfig()
    loadExtends(app)
    loadRedis()

    // 加载db
    const ormConfig = hooh.config('orm') || hooh.config('ormconfig')
    if (!helper.isEmpty(ormConfig)) {
      createOrmConnections(ormConfig as OrmConnectionOptions[])
    }
    // 加载logger
    loadLogger()

    // 加载路由（加载路由时会自动加载控制器）
    loadRoutes(app)
    this.app = app
    return this
  },

  config: function<T = any>(name: string): T | undefined {
    return configLoader.getConfig<T>(name, this._config)
  },

  setOrm: function(orm) {
    if (isOrmSet) {
      throw new Error('Please do not set orm repeatedly!')
    }
    this.orm = orm
    isOrmSet = true
    return this
  },
  scheduleJobs: {},
  scheduleStart: function() {
    if (!this.app) {
      throw new Error('Please createApp first') 
    }
    const {jobs, run} = loadSchedule(this.app)
    setTimeout(()=>{
      this.scheduleJobs = jobs
      run()
    }, 500)
    return this
  },

  start: function(port: null | number | string = null) {
    if (!this.app) {
      throw new Error('Please createApp first')
    }
    port = port || this.config('port') || this.env.HOOH_APP_PORT || 8080
    this.app?.listen(port, ()=>{
      console.log(`Application started，http://localhost:${port}`)
    })
    return this
  }
}

export default hooh


export { 
  Controller,
  Context,
  Next,
  Logic,
  getConnection,
  OrmConnectionOptions as  ConnectionOptions,
  createOrmConnections as createConnections,
  helper,
  decorators
}
