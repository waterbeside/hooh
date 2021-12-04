export default {
  lockedErrorCode: -1, // 被锁时返回的error code
  useAutoRouter: false,  // 是使使用自动路由
  view: {
    path: 'view',
    ext: 'html',
    nunjucksConfig: {
      autoescape: true
    }
  },
  logger: {  // log4js 配置
    appenders: {  
      datafileout: {
          type: 'dateFile', 
          filename: 'logs/datafileout.log', 
          pattern: '.yyyy-MM-dd'
      },
      consoleout: { type: 'console' }, 
    }, 
    categories: {    
        default: { appenders: ['datafileout', 'consoleout'], level: 'debug' },   
    }
  }

}