import { RouteConfigItem } from '../../lib/koaok'

const routes:RouteConfigItem[] = [
  {
    match: '/',
    controller: 'home.index',
    method: 'get'
  },
  {
    match: '/orm',
    controller: 'orm.index',
    method: 'get'
  },
]
export default routes 