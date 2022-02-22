import { Context, Next } from 'koa'


type Code = number | [number, number]

export type TApiReturn = (code: Code, message: any, data?: any,  extra?: any) => void

export type TCtxInput = (key?: string, method?: 'post'|'get'|'body'| null, option?: IInputOption) => any

interface IRturnJson {
  code: number
  msg: string
  data: any
  date: number
  extra: any
}

interface IInputOption {
  multi?: boolean
  toNumber?: boolean
  fn?: (val: any) => any
}




const setApiReturn = async function(ctx: Context, next: Next): Promise<void> {

  ctx.json = function(data: any) {
    ctx.set('Content-Type', 'application/json')
    ctx.body = data
  }

  /**
   * 返回json数据
   * @param  integer $code    [状态码]
   * @param  any $message [描述]
   * @param  any $data    [主要数据]
   * @param  any  $extra   [其它]
   */
  ctx.apiReturn =  function (code: Code, msgOrData: any = '', data: any = null, extra: any = null) {
    let message = msgOrData
    if (typeof msgOrData === 'object') {
      data = msgOrData
      message = ''
    }
    data = data || null
    extra = extra || null
    if ( code instanceof Array ) {
      if (code.length > 1) {
        const statusCode = code[1]
        ctx.status = statusCode
      }
      code = code[0]
    }
    const jsonData: IRturnJson = {
      code,
      msg: message,
      data,
      date: Math.floor((new Date()).valueOf() / 1000),
      extra
    }
    ctx.json(jsonData)
  }
  await next()
}


const setInput = async function(ctx: Context, next: Next): Promise<void> {
  /**
   * 取得请求参数
   * @param key 请求的参数名，不指定则取全部参数
   * @param method 请求方法，get|post|body post为body的别称, 不指定时为全取后合并，并且body优先
   * @param option 请置项 {multi: 参数是否为多个， toNumber:是否转为number类型}
   * @returns {any}
   */
  ctx.input = function(this: any, key: string | null = null, method: 'post'|'get'|'body'| null = null, option: IInputOption = {}) {
    const defaultOption = {
      multi: false,
      toNumber: false,
    }
    const opt:IInputOption = {...defaultOption, ...option}

    // 如果不指定key，则取全部数据 (如果不指定method，则合并get和body的数据)
    if (key === null) {
      return {
        ...(method === null || method === 'get' ? ctx.request.query : {}),
        ...(method === null || ['post','body'].includes(method) ? ctx.request.body : {})
      }
    }

    if (method === null) {
      return ctx.input(key, 'body', option) || ctx.input(key, 'get', option) 
    }
    let val = null
    if (method === 'get') {
      val = ctx.request.query[key] || null
    }
    if (['post','body'].includes(method)) {
      val = (ctx.request.body as any)[key] || null
    }
    if (!val) {
      return null
    }

    if (typeof opt.fn === 'function') {
      val = opt.fn.call(this, val)
    }
    if (val instanceof Array) {
      val = val.map(item => {
        return opt.toNumber ? Number(item) : item
      })
      val = opt.multi ? val : val[0]
    } else {
      val = opt.toNumber ? Number(val) : val
    }
    return val
  }
  await next()
}

export default [ setApiReturn, setInput ]
