const path = require('path')
const render = require('consolidate').ejs.render

module.exports = function template(options) {
  const source = options.source
  return (files, metalsmith, done) => {
    const metaData = metalsmith.metadata()
    Object.keys(files).forEach(fileName => {
      const str = files[fileName].contents.toString()
      setFileContent(
        compile(source, metaData, render)
      )(str, files[fileName], fileName)
    })
    done()
  }
}

function setFileContent(fn) {
  return (str, file, filePath) => {
    return fn(str, filePath)
      .then(res => {
        file.contents = Buffer.from(res)
      })
  }
}

function compile(source, metaData, render) {
  return (str, filePath) => render(str, Object.assign(metaData, {
    filename: path.join(source, filePath)
  }))
}