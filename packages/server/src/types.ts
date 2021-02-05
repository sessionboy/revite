import Koa, { DefaultState, DefaultContext } from 'koa'
import { RequestListener, Server } from 'http'
import { ReviteConfig } from "@revite/types"
import { FSWatcher } from 'chokidar'
import { HMRPayload } from './hmrPayload.js'

export type ServerPlugin = (ctx: ServerPluginContext) => void

export interface ServerPluginContext {
  root: string
  app: Koa<State, Context>
  server: Server
  // watcher: HMRWatcher
  renderer: Function
  routes: Array<any>
  options: ReviteConfig
  port: number
}

export type HMRWatcher = FSWatcher & {
  handleVueReload: (
    filePath: string,
    timestamp?: number,
    content?: string
  ) => void
  handleJSReload: (filePath: string, timestamp?: number) => void
  send: (payload: HMRPayload) => void
}

export interface State extends DefaultState {}

export type Context = DefaultContext &
  ServerPluginContext & {
    read: (filePath: string) => Promise<Buffer | string>
    // map?: SourceMap | null
  }