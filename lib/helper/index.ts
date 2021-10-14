import crypto from 'crypto'
import { isEmpty } from './is'

/**
 * 异步延迟
 * @param {number} time 延迟的时间,单位毫秒
 */
export function sleep(time = 0){
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true)
    }, time)
  })
}


/**
 * md5
 * @param  {String} str [content]
 * @return {String}     [content md5]
 */
export function md5(str: string): string {
  return crypto.createHash('md5').update(str + '', 'utf8').digest('hex')
}

/**
 * escape html
 */
export function escapeHtml(str: string): string {
  return (str + '').replace(/[<>'"]/g, (a: string) => {
    switch (a) {
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '"':
        return '&quote;'
      case '\'':
        return '&#39;'
      default:
        return a
    }
  })
}

/**
 * 给字符串替换参数
 * @param {String} templateStr 要被替换内容的字符串
 * @param {{[key: string]: string}} params 参数
 * @param {{startTag? string, endTag?: string}} options 设置，用于设置替换内容的起始和结束标识符
 */
export function replaceTemplateStr(templateStr: string, params: {[key: string]: string}, options: {
  startTag?: string
  endTag?: string
} = {}): string {
  const defaultOpt = {
    startTag: '${',
    endTag: '}',
  }
  const opt = {
    ...defaultOpt, ...(options || {})
  }

  const reg = new RegExp(`(?<=\\${opt.startTag}).*?(?=\\${opt.endTag})`, 'g')
  const matchParams = templateStr.match(reg) // 匹配出参数（参数用${}包裹）
  let returnStr = templateStr
  if (!isEmpty(matchParams)) {
    for (const param of matchParams as any) {
      const paramReg = new RegExp(`\\${opt.startTag}${param}\\${opt.endTag}`, 'g')
      const paramVal = isEmpty(params) ? '' : (params[param] || '')
      returnStr = returnStr.replace(paramReg, paramVal)
    }
  }
  return returnStr
}