import { Context, Next } from 'koa'


type TApiReturn = (code: number, message: any, data?: any,  extra?: any) => void

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

declare module 'koa' {
  interface DefaultContext {
    json: (data: any) => void
    apiReturn: TApiReturn
    input: (key: string, mehod: 'body'|'get', option: IInputOption) => any
  }
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
  ctx.apiReturn =  function (code: number, message: any = '', data: any = null, extra: any = null) {
    if (typeof message === 'object') {
      data = message
      message = null
    }
    data = data || null
    extra = extra || null
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

  ctx.input = function(key: string, method: 'body'|'get' = 'get', option: IInputOption = {}) {
    const defaultOption = {
      multi: false,
      toNumber: false,
    }
    const opt:IInputOption = {...defaultOption, ...option}
    let val = null
    if (method === 'get') {
      val = ctx.request.query[key] || null
    }
    if (method === 'body') {
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
