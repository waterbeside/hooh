<div align="center">
  <h1>HOOH</h1>
</div>

HOOH是一个为了方便搭建api或MVC服务的后端框架。使用 KOA2 + Typescript + redis + typeorm + nunjucks。免于复杂的配置。

## 1. 快速起步

### 创建项目

```sh
# 安装
npm init hooh <your-project-name>
npm install
```

```sh
# 启动
npm run dev
```

```sh
# 见此即启动成功，打开浏览器访问此地址
Application started，http://localhost:8080
```

### 目录结构

```sh
.
├── app  # 执行build后生成的js文件所在目录
├── nodemon.json
├── package-lock.json
├── package.json
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
│   └── view # 模板文件夹
│       └── home
│           └── index.html
└── tsconfig.json
```

## 2 配置文件

配置文件默认为 src/config/index.ts

```typescript
export default {
  configName: 'configValue'
}
```

其它文件可通过hooh.config('configName') 取得 configValue的值

## 2. 路由 Router

### 2.1 自定义路由

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
    match: '/api/v1/use',
    controller: 'api.v1.user.index',
    method: 'get'
  },
]
export default routes 
```

自定义路由为一个列表，每个路由包含四个属性：

* match: 路由规规，即访问路径

* method: 该路由规则支持的请求类型，如get,post,put

* controller: 路由对应的控制器方法，控制器文件默认放在src/controller文件夹内。如要对应文件名为home的控制器里的index方法，则写为 'home.index', 若控制器文件在多层文件夹内，如路径为src/controller/api/v1/user.ts, 调用index方法，则写为 'api.v1.user.index'

* middlewares: 该路由执行控制器前所执行的中间件列表

```typescript
// src/app.ts
import hooh from 'hooh'
import routes from './routes'

hooh.createApp({
  APP_PATH: __dirname,
  routes,  // 定义好的路由在createApp的方法中注入
}).start()

```

### 2.2 自动路由

自动路由为不编写自定义路由文件的情况下，根据访问地址自动匹配对应的控制器，默认为关闭，通过配置"useAutoRouter: true"打开

```typescript
// src/config/index.ts
export default {
  ...
  useAutoRouter: true
}
```

## 3. 控制器 Controller

控制器文件默认放在 src/controller 文件夹内, 例：

```typescript
// src/controller/home.ts
import { Controller } from 'hooh'

class Home extends Controller {  // 继承基础Controller类
  async index(): Promise<any> {
    this.ctx.body = 'welcome'
  }
}

export default Home
```
