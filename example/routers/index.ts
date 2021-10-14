import { RouteConfigItem } from '../../lib/hooh'

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
  {
    match: '/redis',
    controller: 'redis.index',
    method: 'get'
  },
  {
    match: '/redis/lockit',
    controller: 'redis.lockit',
    method: 'get'
  },
]
export default routes 