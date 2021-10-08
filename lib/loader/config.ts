import path from 'path'
import koaok from '../koaok'

export interface LoadConfigRes {
  [key: string]: any
}


export default {
  loadConfig():LoadConfigRes {
    const configPath = path.join(koaok.options.APP_PATH as string, 'config')
    try {
      const config = require(configPath).default
      return {...config}
    } catch (error) {
      return {}
    }
  },

  /**
   * 取得config
   * @param {string} name 参数key, 分层可以.分格
   * @param {string} configs 所有配置
   */
  getConfig<T = any>(name: string, configs: LoadConfigRes):T | undefined {
    if ( typeof configs[name] !== 'undefined') {
      return configs[name]
    }
    const nameSplit = name.split('.')
    // let tempData: any | null = null
    let res: any
    
    if ( nameSplit.length > 0 ) {
      while (nameSplit) {
        const name = nameSplit.shift()
        const data = res || configs
        if (name && typeof data === 'object') {
          res = {...data}[name]
        } else {
          break
        }
      }
    }

    return res
  }
}
