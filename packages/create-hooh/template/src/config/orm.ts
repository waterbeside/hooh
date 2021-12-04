/**
  This file is used to configure the database connection of typeorm. Written in an array.
*/

import { ConnectionOptions } from 'hooh'

export default <ConnectionOptions[]>[{
  name: 'default',
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'default',
  entitiesPath: ['entity/'], //
  // timezone: '+8',
}]
