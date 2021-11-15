#!/usr/bin/env node


const program = require('commander')
const glob = require('glob')
const path = require('path')
const fs = require('fs')
const os = require('os')
const templateCacheDirectory = path.join(os.homedir(), '.hooh-templates')

const { syncTemp, generate } = require('../lib/sync')


;(function(){
  program.version(require('../package.json').version,'-v,--version').parse(process.argv)
  program.usage('<project-name>')

  let projectName = program.args[0]

  if (!projectName) {
    program.help()
    return
  }

  const list = glob.sync('*') 
  let rootName = path.basename(process.cwd())

  if (list.length) {
    if (list.filter(name => {
        const fileName = path.resolve(process.cwd(), path.join('.', name))
        const isDir = fs.lstatSync(fileName).isDirectory()
        return name === projectName && isDir
      }).length !== 0) {
      console.log(`项目${projectName}已经存在`)
      return
    }
    rootName = projectName
  } else if (rootName === projectName) {
      rootName = '.'
  } else {
      rootName = projectName
  }

  async function run() {
    const template = path.resolve(__dirname, '../template')
    const targetPath = path.resolve(process.cwd(), path.join('.', rootName))
    const options = {
      projectName,
      targetPath,
      template,
    }
    const cacheTemplatePath = path.join(templateCacheDirectory, template.replace(/[\\/\\:]/g, '-'))
    // Copy the template files to a temporary directory
    await syncTemp(template, cacheTemplatePath, options)
    // 从临时目录复制文件到正式目录，并替换模板文件
    await generate(cacheTemplatePath, targetPath, options)
    
  }
  run()
})()
