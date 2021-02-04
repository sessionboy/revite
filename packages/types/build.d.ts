import { Revite, ModuleStore } from "@revite/core"
import { Logger } from "@revite/utils"
import { ReviteConfig } from "./revite"
import { HMRError } from "./hmr"
import { servableFn } from "servable"

export interface BuilderOptions {
  // 构建的目录，通常是src
  revite: Revite
  root: string
  config: ReviteConfig
  cache: any
}

export type initFn = (options:any) => Promise<any>
export type filterFn = (options:any) => boolean
export type Filter = filterFn | RegExp
export type loadFn = (filePath: string, fileExt: string) => Promise<LoadFile>
export type resolveFn = (filePath: string, options:any) => Promise<ResolveResult>
export type transformFn = (fileContext: FileContext, options:any) => Promise<any>
export type doneFn = (initProps:any, options:any) => void
export type BuildPlugin = (options:any) => Promise<Plugin>;
export type DispacthError = (payload: HMRError) => void;

export interface ResolveResult {
  path: string
  write?: boolean
  outputExt?: string
  outputDir?: string
  outputPath?: string
}

export interface PluginOptions {
  config: ReviteConfig
  cache: any
  log: Logger
  dispacthError: DispacthError
}

export interface Plugin {
  name: string
  write?: boolean
  outputDir?: string
  outputExt?: string
  init?: initFn
  load?: loadFn
  filter?: Filter
  resolve?: resolveFn
  transform?: transformFn
  done?: doneFn
}

export interface FileContext {
  fileContents: string
  fileExt: string
  filePath: string
  map?: any
  outputPath: string
  outputExt: string
  relativePath: string
}

export interface TransformResult {
  fileContents: string
  fileExt?: string
  filePath?: string
  map?: any
  outputPath?: string
  outputExt?: string
  relativePath?: string
}

export type BuildResult = FileContext & {
  accessPath: string
  warnings: any[]
};

export interface LoadFile {
  code: string
  map?: any
  warnings: any[]
}

export interface ImportMap {
  imports: {
    [specifier: string]: string
  }
}

export interface LockfileManifest extends ImportMap {
  dependencies: {[packageName: string]: string};
}