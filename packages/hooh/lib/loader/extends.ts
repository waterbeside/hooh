import { Middleware } from 'koa'
import path from 'path'
import hooh, { App } from '../hooh'
import useNunjucks from '../extend/useNunjucks'
import contextExtends from '../extend/context'

export async function loadExtends(app: App): Promise<void> {

  const appPath = hooh.options.APP_PATH
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
    useNunjucks(),
    ...contextExtends,
    ...customerExtends
  ]
  extendsList.forEach((middleware: Middleware) => {
    app.use(middleware)
  })
}