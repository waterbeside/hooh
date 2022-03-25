# HOOH

![HOOH](docs/img/hooh.jpeg)

**English** | [简体中文](./README.zh-CN.md)

**HOOH** pronounce /huː/
It is a back-end framework for building api or MVC services easily. Integrate [KOA2](https://github.com/koajs/koa) + [Typescript](https://github.com/microsoft/TypeScript) + [ioredis](https://github.com/luin/ioredis) + [typeorm](https://github.com/typeorm/typeorm) out of the box, free from complicated configuration.

- [HOOH](#hooh)
  - [1 Quick start](#1-quick-start)
    - [Create project](#create-project)
    - [Directory Structure](#directory-structure)
  - [2 Entry file](#2-entry-file)
    - [options](#options)
  - [3 Configuration file](#3-configuration-file)
  - [4 Router](#4-router)
    - [4.1 Custom routing](#41-custom-routing)
    - [4.2 RouteConfig](#42-routeconfig)
    - [4.2 Automatic routing](#42-automatic-routing)
  - [5 Controller](#5-controller)
    - [5.1 Parameter input](#51-parameter-input)
    - [5.2 Api output](#52-api-output)
    - [Example](#example)
    - [Return](#return)
  - [6 Database](#6-database)
    - [6.1 Connection configuration](#61-connection-configuration)
    - [6.2 Define an entity](#62-define-an-entity)
    - [6.3 Call the database inside the controller](#63-call-the-database-inside-the-controller)
  - [7 Scheduled task](#7-scheduled-task)
    - [7.1 Add configuration](#71-add-configuration)
    - [7.2 Define a scheduler task controller](#72-define-a-scheduler-task-controller)
    - [7.3 Start the scheduled task execution in the entry file](#73-start-the-scheduled-task-execution-in-the-entry-file)
  - [8 Caching with Redis](#8-caching-with-redis)
    - [8.1 configure](#81-configure)
    - [8.2 use](#82-use)
    - [8.3 Its other methods in redis](#83-its-other-methods-in-redis)
      - [8.3.1 redis.cache](#831-rediscache)
      - [8.3.2 redis.lock & redis.unlock](#832-redislock--redisunlock)
      - [8.3.3 @lock decorator](#833-lock-decorator)
      - [8.3.4 @apiCache decorator](#834-apicache-decorator)
  - [9 Log](#9-log)
  - [Deploy](#deploy)
    - [Translate into js file](#translate-into-js-file)
    - [Deploy with PM2](#deploy-with-pm2)
      - [Install pm2](#install-pm2)
      - [Create pm2.json](#create-pm2json)
      - [Startup project](#startup-project)

## 1 Quick start

### Create project

```bash
# Installation
npm init hooh <your-project-name>
npm install
```

```bash
# Launch
npm run dev
```

```bash
# See this is successful startup, open a browser to access this address
Application started，http://localhost:8080
```

### Directory Structure

```bash
.
├── app  # The directory where the js file generated after the build is executed
├── nodemon.json
├── package-lock.json
├── package.json
├── logs # Folder for storing logs
├── src   # Work list
│   ├── app.ts # Entry file
│   ├── config # Configuration folder
│   │   └── index.ts
│   ├── controller # Controller folder
│   │   ├── home.ts
│   │   └── ormSample.ts
│   ├── entity # The folder where the typeorm entity is stored
│   │   └── user.ts
│   ├── routes # Routing configuration folder
│   │   └── index.ts
│   ├── scheduler  # Cron task folder
│   └── view # Template folder
│       └── home
│           └── index.html
├── pm2.json
└── tsconfig.json
```

## 2 Entry file

The entry file is `src/app.ts`

```typescript
// src/app.ts
import hooh from 'hooh'
const options = {
  // ...setting item
}
hooh
  .createApp(options) // Create an application instance
  .start() // start the service
```

### options

| Setting item | Description | Type | Default | Required |
| ----- | ---- | ---- |---- | ---- |
| APP_PATH | App folder path | string |Defaults to the `src` folder for development, and to the `app` folder for production | NO |
| APP_CONTROLLER_PATH | Controller folder path | string | \`${APP_PATH}/controller/\` | NO |
| APP_SCHEDULE_PATH | Cron task folder path | string | \`${APP_PATH}/scheduler/\` | NO |
| routes | Routing configuration | [RouteConfig](#4_Router) |  | NO |
| middlewares | For a list of middleware, please refer to the [middleware](https://github.com/koajs/koa/blob/master/docs/guide.md#writing-middleware) writing in Koa documentation | Koa.Middleware[] |  | NO |

## 3 Configuration file

The configuration file defaults to `src/config/index.ts`

```typescript
export default {
  configName: 'configValue'
}
```

> Start the scheduled task execution in the entry file

## 4 Router

### 4.1 Custom routing

Define route file:
Defined in src/routes/index.ts by default

```typescript
import { RouteConfigItem } from 'hooh'

const routes:RouteConfigItem[] = [
  {
    match: '/', 
    controller: 'home.index',
    method: 'get',
    middlewares: []
  },
  {
    match: '/api/v1/user',
    controller: 'api.v1.user.index',
    method: 'get'
  },
]
export default routes 
```

```typescript
// src/app.ts
import hooh from 'hooh'
import routes from './routes'

hooh.createApp({
  APP_PATH: __dirname,
  routes,  // The defined route is injected in the createApp method
}).start()

```

### 4.2 RouteConfig

Custom routes are a list, each route contains four properties：

| Attributes | Description | Type | Default | Required |
| ----- | ---- | ---- |---- | ---- |
| match | Routing rules, that is, access paths | string | | NO |
| method | Request types supported by this routing rule, such as `get`, `post`, `put` | string | 'get' | No |
| controller | The controller method corresponding to the route. The controller file is placed in the `src/controller` folder by default. <br> To correspond to the index method in the controller whose file name is home, write it as `'home.index'`. <br>If the controller file is in a multi-layer folder, such as the path is `src/controller/api/v1/user.ts`, call the index method, write it as `'api.v1.user.index'` | string |  | Yes |
| middlewares | A list of middleware executed before this route executes the controller | Koa.Middleware[] |  | NO |

### 4.2 Automatic routing

Automatic routing is to automatically match the corresponding controller according to the access address without writing a custom routing file. The default is off, and it can be turned on by configuring `useAutoRouter: true`

```typescript
// src/config/index.ts
export default {
  ...
  useAutoRouter: true
}
```

## 5 Controller

Controller files are placed in the `src/controller` folder by default, for example:

```typescript
// src/controller/home.ts
import { Controller } from 'hooh'

class Home extends Controller {  // Inherit the base Controller class
  async index() {
    this.ctx.body = 'welcome'
  }
}

export default Home
```

### 5.1 Parameter input

> `ctx.input(Key, Method, Options)`
>
> parameter:
>
> - **Key**: *{string}* The parameter name of the request. String is returned by default. When not specified, all parameters are taken and returned as a dictionary object.
> - **Method**: *{string | null}*  Request method, one of 'get' | 'post' | 'body' | null. post is another name for body. It is empty by default. If it is not specified (that is, when it is empty), it will be merged after all fetches, and the body will take precedence.
> - **Options**:
>   - **fn**: *{(any)=>any}* Process the acquired parameter and return the processed value
>   - **toNumber**: *{boolean}*  Whether to convert to a numeric type, the default is false
>   - **multi**: *{boolean}* Whether the parameter has multiple values, the default is false, when it is true, it is returned as an array
>

```typescript
import { Controller } from 'hooh'

class Home extends Controller {
  async index() {
    // get uid and convert to number
    const uid = ctx.input('uid', 'get', {toNumber: false})
    // Get the page number, 1 when empty or 0
    const page = ctx.input('page', 'get', {fn: (val)=>Number(val) || 1})
  }
}

export default Home
```

### 5.2 Api output

> `ctx.apiReturn(Code: number, Msg: string, Data?: any, Extra?: any)`
>
> Parameter
>
> - **Code**: *{number}* Interface error code.
> - **Msg**: *{string | object}*  When it is a string, it is the message to be returned, and when it is an object, it is the third parameter, any data of the business.
> - **Data**: {any} Any business data to return, default is empty
> - **Extra** {any} Other extended data to be returned, default is empty
>

### Example

```typescript
import { Controller } from 'hooh'

class Home extends Controller {
  async index() {
    this.ctx.apiReturn(0, 'Your message', {rows: [], page: 1})
  }
}

export default Home
```

### Return

The above example interface returns the following json string:

```json
{
  "code": 0
  "msg": "Your message",
  "data": {"rows": [], "page": 1},
  "date": 1648128308,  // The time when the current interface returned, a timestamp in seconds
  "extra": null
}
```

## 6 Database

This framework uses [Typeorm](https://github.com/typeorm/typeorm) as the database manipulation tool by default. Please refer to the Typeorm documentation for specific usage. The following is a simple usage example:

### 6.1 Connection configuration

Open the `ormconfig` configuration item in the `src/config/index.ts` configuration file:

```typescript
// src/config/index.ts
export default {
    ormconfig: [
      {
        name: 'default', // connection name
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '12345678',
        database: 'hoohsite',
        entitiesPath: ['entity/site/'], // entity folder path
      }, {
        ... // Support for multiple connection configurations
      }
    ]
    ...
}

```

### 6.2 Define an entity

Define an entity named user inside the `src/entity/site/` folder

```typescript
// src/entity/site/user.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity({name: 'user'})
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column('varchar')
    account: string

    @Column('varchar')
    password: string

    @Column('varchar')
    create_time: string

    @Column('tinyint')
    status: number
}
```

### 6.3 Call the database inside the controller

```typescript
// src/controller/ormSample
import { Controller  } from 'hooh'
import { User } from '../entity/site/user'

class OrmSample extends Controller {
  async index(): Promise<any> {
    const connName = 'default'
    const userRepository = this.orm.getRepository(User, connName)
    // Orm general usage
    const rows = await userRepository.findByIds([1, 2, 3])
    // Use queryBuilder
    const rows2 = await userRepository.createQueryBuilder('user').select().where('user.id < 100').getMany()
    // Direct sql statement query
    const sql = 'select * from user where id < 100'
    const rows3 = await this.orm.getManager(connName).query(sql)
    // output
    this.ctx.apiReturn(0, {rows, rows2, rows3})
  }
}

export default OrmSample
```

## 7 Scheduled task

The scheduled task function is based on [node-schedule](https://github.com/node-schedule/node-schedule). The following is a simple usage example integrated in this framework:

> To use timed tasks, you need to understand **cron expressions** first:

```bash
# cron expressions
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59)
```

### 7.1 Add configuration

Define a scheduled task in the `src/config/schedules.ts` file

```typescript
// src/config/schedules.ts
import { ScheduleConfigItem } from 'hooh'

const schedules:ScheduleConfigItem[] = [
  {
    enable: false, // Whether to enable
    cron: '*/10 * * * * *', // Cron expression
    handle: 'testCron.index', // The corresponding controller
    immediate: false // Whether to execute immediately
  }, {
    // ...Other scheduled tasks
  }
]
export default schedules 
```

Import the configuration just defined in `src/config/index.ts`

```typescript
// src/config/index.ts

import schedules from './schedules'

export default {
    schedules
    // ... other configs
}
```

### 7.2 Define a scheduler task controller

Such controllers are placed in the `src/scheduler` folder by default. Just configured a timed task whose `handle` property is `testCron.index`, which means to execute the index method of the testCron controller. In the `src/scheduler` folder, define a file testCron.ts, the file is written in the same way as the general controller:

```typescript
// src/scheduler/testCron.ts
import hooh, { Controller } from 'hooh'
class TestCron extends Controller {
  async index(): Promise<void> {
    console.log('Example of cron task！')
  }
}
export default TestCron
```

### 7.3 Start the scheduled task execution in the entry file

```typescript
// src/app.ts
import hooh from 'hooh'
const options = {
  // ...setting items
}
hooh
  .createApp(options)
  .scheduleStart() // Add this line to start the scheduled task
  .start()
```

## 8 Caching with Redis

### 8.1 configure

于 `src/config/index.ts` Add redis related configuration

```typescript
// src/config/index.ts

export default {
    redis:  {
      port: 6379, // port
      host: '127.0.0.1', // host
      password: process.env.APP_REDIS_PASSWORD, // password
      family: 4, // 4 (IPv4) or 6 (IPv6)
      db: 0
    }
}
```

### 8.2 use

The redis instance will be hung on the Controller and hooh objects as attributes. For the method, please refer to the [ioredis](https://github.com/luin/ioredis) document. The following is an example used in the controller:

```typescript

import hooh, { Controller } from 'hooh'

class RedisSample extends Controller {
  async index(): Promise<any> {
    const redis = this.redis 
    /*
    You can also use hooh.redis
    const redis = hooh.redis 
    */
    await redis.set('hooh:testGet', 'test get data')
    const getRes = await redis.get('hooh:testGet')
    this.ctx.apiReturn(0, {getRes})
  }
}

export default RedisSample
```

### 8.3 Its other methods in redis

#### 8.3.1 redis.cache

```typescript
import hooh from 'hooh'

async function cacheSample() {
  const key = 'my:reids:key'
  const data = {
    name: 'Cacha Sample'
    descript: 'You can set any data'
  }
  const ex = 60 // Set 60 expiration time
  // set cache data sets the cache (when no parameters are passed in, the cache does not expire)
   await hooh.redis.cache(key, data, ex)

  // get cache data
  const cacheData = await hooh.redis.cache(key)
}
```

#### 8.3.2 redis.lock & redis.unlock

```typescript

import hooh, { Controller } from 'hooh'

class LockSample extends Controller {
  async index(): Promise<any> {
    const lockKey = 'my:redis:lockKey'
    const lockOption = {
      ex: 10, // Lock expiration time (seconds), default 10 seconds
      loop: 50,  // The number of times the lock is requested in a loop, the default is 50 times
      wait: 20， // When the lock fails, the time to wait for the next unlock (milliseconds), the default is 20 milliseconds
    }
    // lock
    await hooh.redis.lock(lockKey, lockOption)
    /*
       ... Other business codes
    */
    // Remember to unlock after executing the code
    await hooh.redis.unlock(lockKey)
  }

}

export default LockSample
```

#### 8.3.3 @lock decorator

@lock(Key, LockOptions)

> `@lock(Key, LockOptions)` Contains key and ex parameters
>
> - **Key**: *string* The key to store data for redis, the corresponding request parameters can be replaced by '${paramName}' in the string
> - *LockOptions*: Configuration items include:
>
>   - **ex**: *{number}* Lock expiration time (seconds), default 10 seconds
>   - **loop**: *{number}*  The number of times the lock is requested in a loop, the default is 50 times
>   - **wait**: *{number}* When the lock fails, the time to wait for the next unlock (milliseconds) The default is 20 milliseconds
>   - **lockReturn**: *{string}* The default value is json'. When it is 'json', whether to return the lock as json when the lock fails (locked by others), usually returns `{"code": -1, "msg": "Locked"}`. Other values will result in an error (return status code 500).
>   - **errorCode**: *{number}* When returned in json, the value of code, the default is -1, the default value can be modified by the `lockedErrorCode` of the configuration file

```typescript
import hooh, { Controller } from 'hooh'
import { lock } from 'hooh/dist/decorators'

class LockSample extends Controller {

  @lock('my:redis:lockKey:${uid}', { ex: 10, loop: 5 })
  async index(): Promise<any> {
    // The incoming uid parameter will automatically replace ${uid} in 'my:redis:lockKey:${uid}'.
    // Supports automatic substitution of multiple parameters.
    const uid = this.ctx.input('uid') 
    await hooh.redis.lock(lockKey, lockOption)
    /*
       ... Other business codes
    */
    // After the code is executed, it will be automatically unlocked
  }
}

export default LockSample
```

#### 8.3.4 @apiCache decorator

Add cache to api controller.

> `@apiCache(key, ex)` Contains `key` and `ex` parameters
>
> - **Key**: *{string}* To cache the key, you can use '${paramName}' to replace the corresponding request parameter in the string
> - **ex**: *{number}* Indicates the cache expiration time, in seconds, the default is 300 seconds

```typescript
import hooh, { Controller } from 'hooh'
import { apiCache } from 'hooh/dist/decorators'

class ApiCacheSample extends Controller {
  @apiCache('my:redis:apiCacheKey:${uid}', 60 * 5 )
  async index(): Promise<any> {
    // The incoming uid parameter will automatically replace ${uid} in 'my:redis:apiCacheKey:${uid}'.
    // Supports automatic substitution of multiple parameters.
    const uid = this.ctx.input('uid') 
    /*
       ... Other business codes
    */
    this.ctx.apiReturn(0, {
      // any data
    })
  }

}

export default LockSample
```

## 9 Log

Log based on [log4js](https://github.com/log4js-node/log4js-node)

```typescript
import hooh from 'hooh'
// Logs can be added at the following different log levels
hooh.logger.debug("Your logger message.")
hooh.logger.info("Your logger message.")
hooh.logger.warn("Your logger message.")
hooh.logger.error("Your logger message!")
hooh.logger.fatal("Your logger message.")
```

The log will be recorded in the `log/` folder, and the terminal will also output:

```bash
[2022-03-24 22:14:37.987] [info] default -Yor logger message!
```

## Deploy

### Translate into js file

Execute `npm run build`, the installer will generate the translated js file in the `app/` directory.
`app/app.js` is the startup file of the project.

```bash
npm run build
```

### Deploy with PM2

#### Install pm2

To use `PM2`, you need to install it globally. If pm2 is not installed, execute:

```bash
npm install -g pm2
```

#### Create pm2.json

When the project is created, a pm2.json file will be generated in the project root directory. If not, please write your own `pm2.json`

```json
// pm2.json
{
  "apps": [{
    "name": "Your-project-name",
    "script": "app/app.js",
    "cwd": "/Your/project/upload/path",
    "exec_mode": "fork",
    "max_memory_restart": "1G",
    "autorestart": true,
    "node_args": [],
    "args": [],
    "env": {
      "NODE_ENV": "production"
    }
  }]
}
```

#### Startup project

```bash
pm2 start pm2.json
```
