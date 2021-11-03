import { RouteConfigItem } from 'hooh'

const routes:RouteConfigItem[] = [
  {
    match: '/',
    controller: 'home.index',
    method: 'get'
  }
]
export default routes 