import { Context, Next } from 'koa'
import { loadController } from './controller'
import koaok, { App, RouteConfigItem } from '../koaok'

export async function loadRoutes(app: App): Promise<void> {
  const ctrLoader = loadController(koaok.options.APP_CONTROLLER_PATH as string)

  for (const routeItem of koaok.options.routes as RouteConfigItem[] ) {
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
    if (koaok.router[method]) {
      koaok.router[method](match, ...fns)
    }
  }

  app.use(async (ctx, next)=>{
    try{
        await next()
        if(!ctx.body){  // 没有资源
          // ctx.body = "404"
          ctx.status = 404
        }
    }catch(e){
      console.log(e)
      // 如果后面的代码报错 返回500
      ctx.body = '500'
    }
  })

  app.use(koaok.router.routes())
  app.use(koaok.router.allowedMethods({ 
    throw: true, // 抛出错误，代替设置响应头状态
    // notImplemented: () => '不支持当前请求所需要的功能',
    // methodNotAllowed: () => '不支持的请求方式'
  }))
}