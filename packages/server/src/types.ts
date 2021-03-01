import { Server } from 'http'
import { Server as ConnectApp } from 'connect'
import { Revite } from '@revite/core'
import { InternalConfig } from "@revite/types"

export type ServerPlugin = (ctx: ServerPluginContext) => void

export interface ServerPluginContext {
  revite: Revite,
  app: ConnectApp
  server: Server|null
  routes: Array<any>
  modules?: SsrModules
  config: InternalConfig
}

interface SsrModules {
  React: any
  renderToString: Function
  renderToNodeStream: Function
  StaticRouter: any
  useRoutes: any
  Routes:any
  Route:any
}
