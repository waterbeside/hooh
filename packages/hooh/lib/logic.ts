
import { Context, Next } from 'koa'
import hooh, { App } from './hooh'

export interface ILogicOption {
  ctx: Context
  next: Next
  app: App
}

export interface ILogicRes<T = any> {
  status: number
  msg: string
  data?: T | null
}

class BaseLogic {
  ctx: Context
  next: Next
  app: App
  orm = hooh.orm
  redis = hooh.redis

  constructor(option: ILogicOption) {
    this.ctx = option.ctx
    this.next = option.next
    this.app = option.app
  }

  getOption(): ILogicOption {
    return {
      ctx: this.ctx,
      next: this.next,
      app: this.app,
    }
  }

  logic<T extends BaseLogic>(logicClass: new (opt: any) => T): T {
    return new logicClass(this.getOption())
  }

  returnRes<T>(status: number, msg: string, data: T | null= null): ILogicRes<T> {
    return {
      status,
      msg,
      data
    }
  }
}

export default BaseLogic