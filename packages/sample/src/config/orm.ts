import { ConnectionOptions } from 'hooh'

export default [{
  name: 'default',
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '12345678',
  database: 'hoohsite',
  entitiesPath: ['entity/site/'],
}
] as ConnectionOptions[]