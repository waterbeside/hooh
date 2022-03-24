# HOOH

![HOOH](docs/img/hooh.jpeg)

**HOOH** 发音 /huː/

是一个为了方便搭建api或MVC服务的后端框架。使用 [KOA2](https://github.com/koajs/koa) + [Typescript](https://github.com/microsoft/TypeScript) + [ioredis](https://github.com/luin/ioredis) + [typeorm](https://github.com/typeorm/typeorm) + [nunjucks](https://github.com/mozilla/nunjucks)，开箱即用， 免于复杂的配置。

## 1 快速起步

### 创建项目

```bash
# 安装
npm init hooh <your-project-name>
npm install
```

```bash
# 启动
npm run dev
```

```bash
# 见此即启动成功，打开浏览器访问此地址
Application started，http://localhost:8080
```

### 目录结构

```bash
.
├── app  # 执行build后生成的js文件所在目录
├── nodemon.json
├── package-lock.json
├── package.json
├── logs # 日志文件夹
├── src   # 工作目录
│   ├── app.ts # 入口文件
│   ├── config # 配置文件夹
│   │   └── index.ts
│   ├── controller # 控制器文件夹
│   │   ├── home.ts
│   │   └── ormSample.ts
│   ├── entity # typeorm entiry 文件夹
│   │   └── user.ts
│   ├── routes # 路由配置文件夹
│   │   └── index.ts
│   ├── scheduler  # 定时任务文件夹
│   └── view # 模板文件夹
│       └── home
│           └── index.html
├── pm2.json
└── tsconfig.json
```

## 2 入口文件

入口文件为 `src/app.ts`

```typescript
// src/app.ts
import hooh from 'hooh'
const options = {
  // ...设置项
}
hooh
  .createApp(options) // 创建应用实例
  .start() // 启动服务
```

### options

| 设置项 | 描述 | 类型 | 默认 | 是否必填 |
| ----- | ---- | ---- |---- | ---- |
| APP_PATH | 应用文件夹位置路径 | string |开发环境时默认为 `src` 文件夹， 生产环境时默认为app文件夹 | NO |
| APP_CONTROLLER_PATH | 控制器文件夹位置路径 | string | \`${APP_PATH}/controller/\` | NO |
| APP_SCHEDULE_PATH | 定时任务文件夹位置路径 | string | \`${APP_PATH}/scheduler/\` | NO |
| routes | 路由配置 | [RouteConfig](#4_路由_Router) |  | NO |
| middlewares | 中间件列表, 请参考Koa文档的中间件写法 | Koa.Middleware[] |  | NO |

## 3 配置文件

配置文件默认为 `src/config/index.ts`

```typescript
export default {
  configName: 'configValue'
}
```

> 其它文件可通过`hooh.config('configName')` 取得 configValue的值

## 4 路由 Router

### 4.1 自定义路由

定义路由文件:
默认于 src/routes/index.ts 内定义

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
  routes,  // 定义好的路由在createApp的方法中注入
}).start()

```

### 4.2 RouteConfig

自定义路由为一个列表，每个路由包含四个属性：

| 属性 | 描述 | 类型 | 默认 | 是否必填 |
| ----- | ---- | ---- |---- | ---- |
| match | 路由规规，即访问路径 | string | | NO |
| method | 该路由规则支持的请求类型，如`get`,`post`,`put` | string | 'get' | No |
| controller | 路由对应的控制器方法，控制器文件默认放在`src/controller`文件夹内。<br> 如要对应文件名为home的控制器里的index方法，则写为 `'home.index'`。<br>若控制器文件在多层文件夹内，如路径为`src/controller/api/v1/user.ts`, 调用index方法，则写为 `'api.v1.user.index'` | string |  | Yes |
| middlewares | 该路由执行控制器前所执行的中间件列表 | Koa.Middleware[] |  | NO |

### 4.2 自动路由

自动路由为不编写自定义路由文件的情况下，根据访问地址自动匹配对应的控制器，默认为关闭，通过配置"useAutoRouter: true"打开

```typescript
// src/config/index.ts
export default {
  ...
  useAutoRouter: true
}
```

## 5 控制器 Controller

控制器文件默认放在 src/controller 文件夹内, 例：

```typescript
// src/controller/home.ts
import { Controller } from 'hooh'

class Home extends Controller {  // 继承基础Controller类
  async index() {
    this.ctx.body = 'welcome'
  }
}

export default Home
```

### 5.1 参数输入

> `ctx.input(Key, Method, Options)`
>
> 参数：
>
> * Key: *{string}* 请求的参数名。默认返回字符串。当不指定时，则取全部参数，以字典对象返回。
> * Method: *{string | null}*  请求方法，为 'get' | 'post' | 'body' | null 中的其中一个。 post为body的别称。默认为空，不指定时(即为空时)为全取后合并，并且body优先。
> * Options:
>   * fn: *{(any)=>any}* 对取得的参数进行加工并返回加工后的值
>   * toNumber: *{boolean}*  是否转为数值类型，默认为 false
>   * multi: *{boolean}* 该参数是否有多个值，默认为 false, 当为true时，以数组型式返回
>

```typescript
import { Controller } from 'hooh'

class Home extends Controller {
  async index() {
    // 取得uid并转为数字
    const uid = ctx.input('uid', 'get', {toNumber: false})
    // 取得页码，当为空或为0时，则为1
    const page = ctx.input('page', 'get', {fn: (val)=>Number(val) || 1})
  }
}

export default Home
```

### 5.2 api输出

> `ctx.apiReturn(Code: number, Msg: string, Data?: any, Extra?: any)`
>
> 参数：
>
> * Code: *{number}* 接口错误码。
> * Msg: *{string | object}*  当字符串时，为要返回的消息，当为对象时，即为第三个参数，业务的任意数据。
> * Data: {any} 要返回的任何业务数据, 默认为空
> * Extra {any} 其它要返回的扩展数据, 默认为空
>

### 示例

```typescript
import { Controller } from 'hooh'

class Home extends Controller {
  async index() {
    this.ctx.apiReturn(0, 'Your message', {rows: [], page: 1})
  }
}

export default Home


```

### 返回

上述示例接口返回以下json字符串：

```json
{
  "code": 0
  "msg": "Your message",
  "data": {"rows": [], "page": 1},
  "date": 1648128308,  // 为当前接口返回时的时间，以秒为单位的时间戳
  "extra": null
}
```


## 6 数据库

本框架默认使用[Typeorm](https://github.com/typeorm/typeorm)作为数据库操作工具。具体用法请参考`Typeorm`文档，以下是简单用法示例：

### 6.1 连接配置

于`src/config/index.ts`配置文件开启`ormconfig`配置项：

```typescript
// src/config/index.ts
export default {
    ormconfig: [
      {
        name: 'default', // 连接名称
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '12345678',
        database: 'hoohsite',
        entitiesPath: ['entity/site/'], // entity文件夹位置
      }, {
        ... // 支持多个连接配置
      }
    ]
    ...
}

```

### 6.2 定义一个entity

在`src/entity/site/`文件夹内定义一个名为user的entity

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

### 6.3 在控制器内调用数据库

```typescript
// src/controller/ormSample
import { Controller  } from 'hooh'
import { User } from '../entity/site/user'

class OrmSample extends Controller {
  async index(): Promise<any> {
    const connName = 'default'
    const userRepository = this.orm.getRepository(User, connName)
    // orm一般用法
    const rows = await userRepository.findByIds([1, 2, 3])
    // 使用queryBuilder
    const rows2 = await userRepository.createQueryBuilder('user').select().where('user.id < 100').getMany()
    // 直接sql语句查询
    const sql = 'select * from user where id < 100'
    const rows3 = await this.orm.getManager(connName).query(sql)
    // 输出
    this.ctx.apiReturn(0, {rows, rows2, rows3})
  }
}

export default OrmSample
```

## 7 定时任务

定时任务功能基于[node-schedule](https://github.com/node-schedule/node-schedule)。以下是集成在本框架中的简单使用示例：

### 7.1 添加配置

在 `src/config/schedules.ts`文件中定义一个定时任务

```typescript
// src/config/schedules.ts
import { ScheduleConfigItem } from 'hooh'

/** cron 表达式
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)
 */

const schedules:ScheduleConfigItem[] = [
  {
    enable: false, // 是否启用
    cron: '*/10 * * * * *', // cron 表达式
    handle: 'testCron.index', // 对应的控制器
    immediate: false // 是否立即执行
  }
]
export default schedules 
```

在 `src/config/index.ts` 导入刚才定义的配置

```typescript
// src/config/index.ts

import schedules from './schedules'

export default {
    schedules
    // ... other configs
}
```

### 7.2 定义定时任务控制器

此类控制器默认放在 `src/scheduler` 文件夹下。刚才配置一个定时任务，其`handle`属性为  `testCron.index`, 意为执行 testCron控制器的index方法。 在 `src/scheduler` 文件夹下，定义一个 testCron.ts的文件，文件写法与一般控制器的写法一致：

```typescript
// src/scheduler/testCron.ts
import hooh, { Controller } from 'hooh'
class TestCron extends Controller {
  async index(): Promise<void> {
    console.log('定时任务示例 test cron')
  }
}
export default TestCron
```

### 7.3 在入口文件启动定时任务执行

```typescript
// src/app.ts
import hooh from 'hooh'
const options = {
  // ...设置项
}
hooh
  .createApp(options)
  .scheduleStart() // 添加此行，启动定时任务
  .start()
```

## 8 使用Redis缓存

### 8.1 配置

于 `src/config/index.ts` 添加redis相关配置

```typescript
// src/config/index.ts

export default {
    redis:  {
      port: 6379, // 端口
      host: '127.0.0.1', // host
      password: process.env.APP_REDIS_PASSWORD, // 密码
      family: 4, // 4 (IPv4) or 6 (IPv6)
      db: 0
    }
}
```

### 8.2 使用

redis实例会作为属性挂在Controller以及hooh对象上，其方法可参考 [ioredis](https://github.com/luin/ioredis)文档, 以下是在控制器中使用的示例：

```typescript

import hooh, { Controller } from 'hooh'

class RedisSample extends Controller {
  async index(): Promise<any> {
    const redis = this.redis 
    /*
    也可以使用 hooh.redis 
    const redis = hooh.redis 
    */
    await redis.set('hooh:testGet', 'test get data')
    const getRes = await redis.get('hooh:testGet')
    this.ctx.apiReturn(0, {getRes})
  }
}

export default RedisSample
```

### 8.3 其于redis的其它方法

#### 8.3.1 redis.cache

```typescript
import hooh from 'hooh'

async function cacheSample() {
  const key = 'my:reids:key'
  const data = {
    name: 'Cacha Sample'
    descript: 'You can set any data'
  }
  const ex = 60 // 设置60过期时间
  // set cache data 设置缓存 (不传入参数时，缓存不过期)
   await hooh.redis.cache(key, data, ex)

  // get cache data 取得缓存
  const cacheData = await hooh.redis.cache(key)
}
```

#### 8.3.2 redis.lock 和 redis.unlock

```typescript

import hooh, { Controller } from 'hooh'

class LockSample extends Controller {
  async index(): Promise<any> {
    const lockKey = 'my:redis:lockKey'
    const lockOption = {
      ex: 10, // 锁过期的时间（秒），默认10秒
      loop: 50,  // 循环请求锁的次数，默认50次
      wait: 20， // 加锁失败时，等待下次解锁的时长（毫秒），默认20亳秒
    }
    // 加锁
    await hooh.redis.lock(lockKey, lockOption)
    /*
       ... 其它业务代码
    */
    // 执行完代码记得解锁
    await hooh.redis.unlock(lockKey)
  }

}

export default LockSample
```

#### 8.3.3 @lock装饰器

@lock(Key, LockOptions)

> `@lock(Key, LockOptions)` 包含key和ex两参数
>
> * Key: *string* 为redis存放数据的key, 字符串内可使用 '${paramName}' 替换对应的请求参数
> * LockOptions: 配置项包括:
>
>   * ex: *{number}* 锁过期的时间（秒），默认10秒
>   * loop: *{number}*  循环请求锁的次数，默认50次
>   * wait: *{number}* 加锁失败时，等待下次解锁的时长（毫秒），默认20亳秒
>   * lockReturn: *{string}*, // 默认值为'json', 当为 'json' 时取锁失败(被其它人锁定)时是否以json返回，一般会返回 {code: -1, msg: "Locked"}。其它值则会执错（返回状态码500）。
>   * errorCode: *{number}* 以json返回时，code的值，默认为-1, 该默认值 可通过配置文件的lockedErrorCode修改

```typescript

import hooh, { Controller } from 'hooh'
import { lock } from 'hooh/dist/decorators'

class LockSample extends Controller {

  @lock('my:redis:lockKey:${uid}', { ex: 10, loop: 5 })
  async index(): Promise<any> {
    // 传入的uid参数会自动替换'my:redis:lockKey:${uid}' 中的 ${uid}。
    // 支持多个参数的自动替换。
    const uid = this.ctx.input('uid') 
    await hooh.redis.lock(lockKey, lockOption)
    /*
       ... 其它业务代码
    */
    // 执行完代码会自动解锁
  }

}

export default LockSample
```

#### 8.3.4 @apiCache装饰器

给api控制器添加缓存。
> `@apiCache(key, ex)` 包含key和ex两参数
>
> * Key: *{string}* 为缓存key, 字符串内可使用 '${paramName}' 替换对应的请求参数
> * ex: *{number}* 为缓存过期时间，单为为秒，默认为300秒

```typescript

import hooh, { Controller } from 'hooh'
import { apiCache } from 'hooh/dist/decorators'

class ApiCacheSample extends Controller {

  @apiCache('my:redis:apiCacheKey:${uid}', 60 * 5 )
  async index(): Promise<any> {
    // 传入的uid参数会自动替换'my:redis:apiCacheKey:${uid}' 中的 ${uid}。
    // 支持多个参数的自动替换。
    const uid = this.ctx.input('uid') 
    /*
       ... 其它业务代码
    */
    this.ctx.apiReturn(0, {
      // any data
    })
    // 执行完代码会自动解锁
  }

}

export default LockSample
```

## 9 日志

日志基于[log4js](https://github.com/log4js-node/log4js-node)

```typescript
import hooh from 'hooh'
// 可以以下不同的日志级别添加日志
hooh.logger.debug("Your logger message.")
hooh.logger.info("Your logger message.")
hooh.logger.warn("Your logger message.")
hooh.logger.error("Your logger message!")
hooh.logger.fatal("Your logger message.")
```

日志会记录在 `log/`文件夹内，而终端也会输出:

```bash
[2022-03-24 22:14:37.987] [info] default -Yor logger message!
```

## 部署

### 转译成js文件

执行 `npm run build` ，装会在 `app/`目录下生成编译后的js文件。
`app/app.js`即为项目的启动文件。

```bash
npm run build
```

### 使用PM2部署

#### 安装pm2

使用 `PM2` 需要以全局的方式安装，如果未安装pm2，请执行：

```bash
npm install -g pm2
```

#### 编写pm2.json

项目创建时，会在项目根目录下生成一个pm2.json的文件，如果没有，请自行编写`pm2.json`

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

#### 启动项目

```bash
pm2 start pm2.json
```
