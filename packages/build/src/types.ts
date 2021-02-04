
export type initFn = (options:any) => Promise<any>
export type filterFn = (options:any) => Promise<boolean>
export type Filter = filterFn | RegExp
export type resolveFn = (filePath: string, options:any) => Promise<ResolveResult>
export type transformFn = (filePath: string, options:any) => Promise<any>
export type doneFn = (initProps:any, options:any) => void
export type BuildPlugin = (options:any) => Promise<Plugin>;
export type BuildPluginResult = Promise<Plugin>

export interface ResolveResult {
  path: string
  write?: boolean
  outputExt?: string
  outputDir?: string
  outputPath?: string
}

export interface Plugin {
  name: string
  write?: boolean
  outputDir?: string
  outputExt?: string
  init?: initFn
  filter?: Filter
  resolve: resolveFn
  transform: transformFn
  done?: doneFn
}

export interface ImportMap {
  imports: {[specifier: string]: string};
}

export interface LockfileManifest extends ImportMap {
  dependencies: {[packageName: string]: string};
}