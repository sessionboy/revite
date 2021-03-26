import { Server } from 'http'
import { Revite } from "../core/index.js"
import { Server as ConnectApp } from 'connect'
import { InternalConfig } from "@revite/types"
import WebSocket from "./ws.js"

export type ServerPlugin = (ctx: ServerPluginContext) => void
export type ServerMiddleware = (ctx: ServerContext) => void

export interface ServerContext {
  revite: Revite
  config: InternalConfig
  app: ConnectApp
  server: Server|null
  routes: Array<any>
  modules?: SsrModules
  ws?: WebSocket
}

export interface ServerPluginContext {
  revite: Revite
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
