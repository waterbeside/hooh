import path from 'path'
import koaok from './koaok'
import { createConnections, Connection, ConnectionOptions } from 'typeorm'


export type OrmConnectionOptions =  ConnectionOptions & {
  entitiesPath?: string[]
}

export interface IConnectionMap {
  [key: string]: Connection
}


export function formatExt(entiry: any): any {
  if (typeof entiry === 'string') {
    const isTsRun = process.env.TS_RUN ? process.env.TS_RUN.trim()  === '1' : false
    if (!/.[jt]s$/.test(entiry)) {
      entiry += isTsRun ? '.ts' : '.js'
    } else {
      entiry = isTsRun ? entiry.replace(/.js$/, '.ts') : entiry.replace(/.ts$/, '.js')
    }
  }
  return entiry
}

const connectionMap: IConnectionMap = {}

export async function createOrmConnections(config: OrmConnectionOptions[]): Promise<any> {
    const conns = config && config instanceof Array && config.length > 0 ? config : null
    if (!conns) { 
      return {}
    } else {
      const connsformatted = []
      for ( const item of conns ) {

        let entities = item?.entities || null
        const entitiesPath = item?.entitiesPath || null
        if (!entities) {
          if  (entitiesPath) {
            entities = entitiesPath.map((pathItem: any) => {
              return formatExt(path.join(koaok.options.APP_PATH as string, pathItem, '*'))
            })
          } else {
            continue
          }
        } else {
          entities = entities.map((entity) => formatExt(entity))
        }
        const configItem = {
          ...item,
          name: item.name || 'default',
          synchronize: item.synchronize || false,
          logging: item.logging || false,
          entities
        }
        if (item.migrations) {
          configItem.migrations = item.migrations.map((item) => formatExt(item))
        }
        if (item.subscribers) {
          configItem.subscribers = item.subscribers.map((item) => formatExt(item))
        }
        connsformatted.push(configItem)        
      }
      const connections = await createConnections(connsformatted)

      
      for (const connection of connections) {
        connectionMap[connection.name] = connection
      }
      return connectionMap
    }
}

  export async function getConnection(): Promise<IConnectionMap>
  export async function getConnection(name: string): Promise<Connection>
  export  async function getConnection(name: string|undefined = undefined): Promise<IConnectionMap | Connection> {
    if (!connectionMap || Object.keys(connectionMap).length < 1) {
      const res = await createOrmConnections(koaok.config('orm') as OrmConnectionOptions[])
      if (!res || Object.keys(res).length < 1) {
      }
    }
    if (name) {
      if (typeof connectionMap[name] === 'undefined') {
        throw new Error(`No ${name} connection`)
      }
      return connectionMap[name]
    }
    return connectionMap
  }