import { Middleware } from 'koa'
import path from 'path'
import Koaok, { App } from '../koaok'
import contextExtends from '../extend/context'

export async function loadExtends(app: App): Promise<void> {

  const appPath = Koaok.options.APP_PATH
  const contextPath = path.join(appPath as string, 'extends/context')

  let customerContextExtends = []
  try {
    customerContextExtends = require(contextPath).default
  } catch (error) {
    // PASS
  }
  const extendsList = [
    ...contextExtends,
    ...customerContextExtends
  ]
  extendsList.forEach((middleware: Middleware) => {
    app.use(middleware)
  })
}