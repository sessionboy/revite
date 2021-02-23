import Koa, { DefaultState, DefaultContext } from 'koa'
import { Server } from 'http'
import { InternalConfig } from "@revite/types"

export type ServerPlugin = (ctx: ServerPluginContext) => void

export interface ServerPluginContext {
  root: string
  app: Koa<State, Context>
  server: Server
  renderer: Function
  routes: Array<any>
  options: InternalConfig
  port: number
}

export interface State extends DefaultState {}

export type Context = DefaultContext & ServerPluginContext