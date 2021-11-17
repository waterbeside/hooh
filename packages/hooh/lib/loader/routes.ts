import { Context, Next } from 'koa'
import { loadController } from './controller'
import hooh, { App, RouteConfigItem } from '../hooh'

export async function loadRoutes(app: App): Promise<void> {
  const ctrLoader = loadController(hooh.options.APP_CONTROLLER_PATH as string)

  for (const routeItem of hooh.options.routes as RouteConfigItem[] ) {
    const { match, method = 'get', controller, middlewares } = routeItem
    let fns: any[] = []
  
    if ((middlewares && middlewares.length)) {
      fns = fns.concat(middlewares)
    }
    if (!controller) {
      continue
    }
    
    fns.push(async (context: Context, next: Next): Promise<any> => {
      const controllerSplit = controller.split('.')
      if (controllerSplit.length < 2) {
        await next()
      }
      const controllerName = controllerSplit.slice(0, -1).join('.')
      const controllerMethod = controllerSplit[controllerSplit.length - 1]
      const controllerClass = ctrLoader.getClass(controllerName)
      const option = {
        ctx: context,
        next,
        app
      }
      const controllerInstance = new controllerClass(option)
      if (controllerInstance && controllerInstance[controllerMethod]) {
        await controllerInstance[controllerMethod](option)
      }
    })
    if (hooh.router[method]) {
      hooh.router[method](match, ...fns)
    }
  }

  // SET 404 OR 500
  app.use(async (ctx, next)=>{
    try{
      await next()
      if(!ctx.body){  // 没有资源
        ctx.body = '404'
        ctx.status = 404
      }
    }catch(e){
      console.log(e)
      // 如果后面的代码报错 返回500
      ctx.body = '500'
    }
  })

  // AUTO ROUTER
  if (hooh.config('useAutoRouter')) {
    app.use(async (ctx, next) => {
      await next()
      if(!ctx.body){  // 如果body没返回（没匹配到自定义路由，则自动查找路由）
        const url = ctx.url.split('?')[0]
        const actions = url.split('/').slice(1)
        const pathClassName = actions.slice(0, -1).join('.').toLowerCase()
        const controllerMethod = actions[actions.length - 1] || 'index'
        let controllerClass
        try {
          controllerClass = ctrLoader.getClass(pathClassName)
        } catch (error) {
          return
        }
        const option = {
          ctx,
          next,
          app
        }
        const controllerInstance = new controllerClass(option)
        if (controllerInstance && controllerInstance[controllerMethod]) {
          await controllerInstance[controllerMethod](option)
        }
      }
    })
  }
  
  app.use(hooh.router.routes())
  app.use(hooh.router.allowedMethods({ 
    throw: true, // 抛出错误，代替设置响应头状态
    // notImplemented: () => '不支持当前请求所需要的功能',
    // methodNotAllowed: () => '不支持的请求方式'
  }))
}