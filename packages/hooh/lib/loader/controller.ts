import glob from 'glob'
import path from 'path'

interface IControllerLoaderReturn {
  getClass: (pathClassName:string) => any
}



export const loadController = function(controllerPath: string): IControllerLoaderReturn {
  const controllerMap = new Map()
  const controllerClass = new Map()
  const isTsRun = process.env.TS_RUN ? process.env.TS_RUN.trim()  === '1' : false
  const files = glob.sync(`${controllerPath}/**/*.${isTsRun ? 'ts' : 'js'}`)
  files.forEach(filepath => {
    filepath = path.resolve(filepath)
    let pathClassName = filepath.replace(controllerPath, '')
    // console.log('pathClassName', pathClassName)
    pathClassName = pathClassName.substring(1, pathClassName.length - 3)
    pathClassName = pathClassName.replace(/[/|\\]/g, '.')

    if (controllerMap.has(pathClassName)) {
      throw new Error(`${controllerPath}文件夹下有${pathClassName}文件同名!`)
    } else {
      controllerMap.set(pathClassName.toLowerCase(), filepath)
    }
  })
  return {
    getClass(pathClassName: string): any {
      pathClassName = pathClassName.toLowerCase()
      if (controllerMap.get(pathClassName)) {
        if (!controllerClass.get(pathClassName)) {
          const c = require(controllerMap.get(pathClassName))
          controllerClass.set(pathClassName, c.default)
        }
        return controllerClass.get(pathClassName)
      } else {
        throw new Error(`${controllerPath}文件夹下没有${pathClassName}文件`)
      }
    }
  }
}