import nunjucks, { Environment } from 'nunjucks'
import hooh, { Context, Next } from '../hooh'
import path from 'path'


declare module 'koa' {
  interface DefaultContext {
    render: Environment['render']
  }
}
export default function useNunjucks() {
  const config = hooh.config<any>('view') || {}
  
  if (Array.isArray(config.path)) {
    config.path = config.path.map((item: string) => path.resolve(hooh.options.APP_PATH || '', item))
  } else {
    config.path = path.resolve(hooh.options.APP_PATH || '', config.path)
  }
  const env = nunjucks.configure(config.path, config?.nunjucksConfig || { autoescape: true })


  return async (ctx: Context, next: Next) => {
    ctx.render =  (view, context) => {
      view += '.' + (config?.ext || 'html')
      const s = env.render(view, {...ctx.state, ...context})
      ctx.type = 'html'
      ctx.body = s
      return s
    }
    await next()
  }
}
