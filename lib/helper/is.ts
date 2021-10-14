
/**
 * 以Object.prototype.toString方法取得对象类型
 * @param obj 任何对象
 * @returns {string}
 */
export function objToString(obj: any): string {
  return Object.prototype.toString.call(obj)?.slice(8, -1)
}

export function isRegExp(obj: any) {
  return objToString(obj) === 'RegExp'
}

export function isNull(obj: any): boolean {
  return obj === null
}

export function isUndefined(obj: any): boolean  {
  return obj === void 0
}

/**
 * 检查是否Array
 * @param arg 
 * @returns 
 */
export function isArray(obj: any): boolean {
  if (Array.isArray) {
    return Array.isArray(obj)
  }
  return Object.prototype.toString.call(obj) === '[object Array]'
}

/**
 * 是否为空 undefined,null,''
 * @param obj 
 * @returns 
 */
export function isEmpty(obj: any): boolean {
  if (isUndefined(obj) || isNull(obj) || obj === '') return true
  if (typeof obj === 'number' && isNaN(obj)) return true
  if ((typeof obj === 'string' || isArray(obj)) && obj.length === 0) return true
  if (typeof obj === 'object' && obj !== null && Object.keys(obj).length === 0) true
  if (obj === false) return true
  return false
}
