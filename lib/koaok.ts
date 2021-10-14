import path from 'path'
import dotenv from 'dotenv'
import fs from 'fs'
import Koa from 'koa'
import Controller from './controller'
import Logic from './logic'
import configLoader, { LoadConfigRes } from './loader/config'
import { loadRoutes } from './loader/routes'
import { loadExtends } from './loader/extends'
import { Redis, loadRedis } from './loader/redis'
import bodyParser from 'koa-bodyparser'
import Router from 'koa-router'
import { getConnection, createOrmConnections, OrmConnectionOptions } from './ormConnections'
import { Context } from 'koa'
import * as helper from './helper'

export { 
  Controller,
  Context,
  Logic,
  getConnection,
  OrmConnectionOptions as  ConnectionOptions,
  createOrmConnections as createConnections,
  helper
}

type methodType = 'get'|'post'|'all'|'put'|'link'|'unlink'|'delete'|'del'|'head'|'options'|'patch'

export interface RouteConfigItem {
  match: string
  method?:  methodType
  controller: string
  middlewares?: Koa.Middleware[]
}

interface CreateAppOptions {
  APP_PATH?: string
  APP_CONTROLLER_PATH?: string
  routes?: RouteConfigItem[]
  middlewares?: Koa.Middleware[]
  [key:string]: any
}

declare module 'koa' {
  interface DefaultContext {
    koaok: Koaok
  }
}


export interface App extends Koa { 
  koaok: Koaok
}


export interface Koaok {
  app?: App
  _config: LoadConfigRes
  options: CreateAppOptions
  createApp: (opt: CreateAppOptions) => App
  config: <T>(name: string) => T | undefined
  Controller: typeof Controller
  Logic: typeof Logic
  redis: Redis
  controller?: Controller,
  router: Router
}





// .env环境变量读取
const nodeEnv = process.env.NODE_ENV ?  process.env.NODE_ENV.trim() : 'production'
process.env.NODE_ENV = nodeEnv
// const isDev = nodeEnv === 'development'

dotenv.config({ path: path.join(process.cwd(), '.env') })
try {
  const envConfig = dotenv.parse(fs.readFileSync(path.join(process.cwd(), `.env.${nodeEnv}.local`)))
  for (const k in envConfig) {
    process.env[k] = envConfig[k]
  }
} catch (error: any) {
  console.log(error.message)
}


export const router = new Router

function createControllerPath (appPath: string): string {
  return path.join(appPath, 'controller')
}

// Kook
const koaok:Koaok = {
  _config: {},
  Controller,
  Logic,
  router,
  redis: {} as Redis,
  options:(()=>{
    const appPath = path.join(process.cwd(), 'src')
    const appControllerPath = createControllerPath(appPath)
    return {
      APP_PATH: appPath,
      APP_CONTROLLER_PATH: appControllerPath
    }
  })(),
  createApp: function(opt:CreateAppOptions) {

    if (this.app) return this.app
    const options = {
      ...this.options, ...opt
    }
    if (!opt.APP_CONTROLLER_PATH) {
      options.APP_CONTROLLER_PATH = createControllerPath(options.APP_PATH as string)
    }
    this.options = options
    const app = new Koa() as App
    app.koaok = koaok
    app.use(bodyParser());
    if (this.options.middlewares && this.options.middlewares.length > 0) {
      this.options.middlewares.forEach((item) => {
        app.use(item)
      })
    }

    // 加载config
    this._config = configLoader.loadConfig()
    loadExtends(app)
    loadRedis()
    // 加载路由（加载路由时会自动加载控制器）
    loadRoutes(app)
    
    this.app = app
    return this.app
  },
  config: function<T = any>(name: string): T | undefined {
    return configLoader.getConfig<T>(name, this._config)
  }
}





export default koaok