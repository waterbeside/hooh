import path from 'path'
import Koa from 'koa'
import Controller from './controller'
import Logic from './logic'
import configLoader, { LoadConfigRes } from './loader/config'
import { loadRoutes } from './loader/routes'
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

type methodType = 'get'|'post'|'all'|'put'|'link'|'unlink'|'delete'|'del'|'head'|'options'|'patch'

export interface RouteConfigItem {
  match: string
  method?:  methodType
  controller: string
  middlewares?: Koa.Middleware[]
}

export type RouteConfig = RouteConfigItem[]
interface CreateAppOptions {
  APP_PATH?: string
  APP_CONTROLLER_PATH?: string
  routes?: RouteConfig
  middlewares?: Koa.Middleware[]
  env?: string
  [key:string]: any
}

declare module 'koa' {
  interface DefaultContext {
    hooh: Hooh
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
}


export const router = new Router

function createControllerPath (appPath: string): string {
  return path.join(appPath, 'controller')
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
  options:(()=>{
    const appPath = path.join(process.cwd(), 'src')
    const appControllerPath = createControllerPath(appPath)
    return {
      APP_PATH: appPath,
      APP_CONTROLLER_PATH: appControllerPath
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

  start: function(port: null | number | string = null) {
    if (!this.app) {
      throw new Error('Please first createApp')
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
