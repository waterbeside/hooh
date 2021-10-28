export default {
  lockedErrorCode: -1, // 被锁时返回的error code
  useAutoRouter: false,  // 是使使用自动路由
  view: {
    path: 'view',
    ext: 'html',
    nunjucksConfig: {
      autoescape: true
    }
  }

}