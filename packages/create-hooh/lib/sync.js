const path = require('path')
const fs = require('fs')
const Metalsmith = require('metalsmith')
const ask = require('./ask')
const template = require('./template')



function getLocalTemplatePath(templatePath) {
  return path.isAbsolute(templatePath)
    ? templatePath
    : path.normalize(path.join(process.cwd(), templatePath));
}

function isExist(dir) {
  dir = path.normalize(dir)
  try {
    fs.accessSync(dir, fs.R_OK)
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Copy files to a temporary directory
 * @param {*} templatePath 模版源文件目录
 * @param {*} cacheTemplatePath 临时目录
 * @returns {Promise}
 */
exports.syncTemp = function(templatePath, cacheTemplatePath) {
  const template = getLocalTemplatePath(templatePath);
    if (!isExist(template)) {
      console.log();
      logger.error('The template is a local template, but it does not exist. The template path is "%s".', template);
      return;
    }

    return new Promise(resolve => {
      Metalsmith(template)
        .clean(true)
        .source('.')
        .destination(cacheTemplatePath)
        .build((err, files) => {
          if (err) {
            console.log();
            logger.error('Local template synchronization failed, reason: "%s".', err.message.trim());
          }
          resolve(cacheTemplatePath);
        });
    });
}

/**
 * 从临时模板目录生成正式文件到当前工作目录
 * @param {*} cacheTemplatePath 
 * @param {*} targetPath 
 * @param {*} options 
 * @returns 
 */
exports.generate = function (cacheTemplatePath, targetPath, options) {
  console.log('run generate : cacheTemplatePath: ', cacheTemplatePath)
  const metalsmith = Metalsmith(cacheTemplatePath);
  options.source = cacheTemplatePath
  return new Promise(resolve => {
    metalsmith
      .use(ask(options))
      .use(template(options))
      .clean(true)
      .source('.')
      .destination(targetPath)
      .build((err, files) => {
        if (err) {
          console.log();
          console.error('Local template synchronization failed, reason: "%s".', err.message.trim());
        }
        resolve(targetPath);
      });
  });
}

