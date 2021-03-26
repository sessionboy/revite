import { InternalConfig } from "@revite/types"

export type initFn = (options:any) => Promise<any>
export type filterFn = (options:any) => Promise<boolean>
export type Filter = filterFn | RegExp
// export type resolveFn = (filePath: string, options:any) => Promise<ResolveResult>
export type transformFn = (filePath: string, options:any) => Promise<any>
export type doneFn = (initProps:any, options:any) => void
export type BuildPlugin = (options:any) => Promise<Plugin>;
export type BuildPluginResult = Promise<Plugin>

export type ReadyFn = (options:any) => Promise<InternalConfig>
export type ResolveFn = (id: string, importer?: string) => Promise<ResolveResult|string>
export type LoadFn = (id: string) => Promise<any>
export type TransformFn = (code: string, options?:any) => Promise<TransformResult|null|undefined>
export type BundleFn = (code: string, options?:any) => Promise<any>
export type DoneFn = () => void

export interface ResolveResult {
  id: string
  external?: boolean
}

export interface TransformResult {
  code: string|Buffer
  map?: any
}

export interface Plugin {
  name: string
  filter: Filter
  ready?: ReadyFn
  resolve?: ResolveFn
  load?: LoadFn
  transform?: TransformFn
  bundle?: BundleFn
  done?: DoneFn
}

export interface ImportMap {
  imports: {[specifier: string]: string};
}

export interface LockfileManifest extends ImportMap {
  dependencies: {[packageName: string]: string};
}