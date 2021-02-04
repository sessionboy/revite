import { BuildPlugin } from "./build"

export interface ReviteConfig {
  port: number
  root: string
  appSrc: string
  publicPath: string
  packageJson: string
  htmlPath: string
  ssr?: SsrOptions
  alias?: Record<string, string>
  plugins?: Array<any>
  installOptions: any
  serverOptions: ServerOptions
  devOptions: devOptions
  buildOptions: BuildOptions
}

export interface SsrOptions {
  mode?: "stream"|"general"
  routeType?: "config"|"file"
  routes?: string
  layout?: string
}

export interface ServerOptions {
  protocol?: string
  hostname?: string
  port?: number
}

export interface devOptions {
  protocol?: string
  hostname?: string
  port?: number
}

export interface BuildOptions {
  outputDir: string
  webModulesDir: string
  importMapJson: any
  clientDir: string
  serverDir: string
  serviceDir: string
  baseUrl?: string
  sourceMaps?:boolean
  plugins: BuildPlugin[]
}
