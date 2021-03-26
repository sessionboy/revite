import Koa, { DefaultState, DefaultContext } from 'koa'
import { Server } from 'http'
import { Server as ConnectApp } from 'connect'
import { Revite } from '@revite/core'
import { InternalConfig } from "@revite/types"

export type ServerPlugin = (ctx: ServerPluginContext) => void

export interface ServerPluginContext {
  revite: Revite,
  root: string
  app: ConnectApp
  server?: Server
  renderer: Function
  routes: Array<any>
  options: InternalConfig
  port: number
}

export interface State extends DefaultState {}

export type Context = DefaultContext & ServerPluginContext