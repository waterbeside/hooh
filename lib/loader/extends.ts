import { Middleware } from 'koa'
import path from 'path'
import Koaok, { App } from '../koaok'
import contextExtends from '../extend/context'

export async function loadExtends(app: App): Promise<void> {

  const appPath = Koaok.options.APP_PATH
  const extendsPath = path.join(appPath as string, 'extends')

  let customerExtends = []
  try {
    customerExtends = require(extendsPath).default
    if (!(customerExtends instanceof Array)) {
      customerExtends = []
    }
  } catch (error) {
    // PASS
  }
  const extendsList = [
    ...contextExtends,
    ...customerExtends
  ]
  extendsList.forEach((middleware: Middleware) => {
    app.use(middleware)
  })
}