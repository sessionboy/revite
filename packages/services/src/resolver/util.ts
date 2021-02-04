import fs from 'fs-extra'
import path from "path"
import slash from "slash";
import { cleanUrl, resolveFrom } from "@revite/utils"
import { resolveOptimizedCacheDir } from "@revite/rollup"
import Resolver from "./index.js"

interface NodeModuleInfo {
  entry: string | undefined
  entryFilePath: string | undefined
  pkg: any
}
export const moduleIdToFileMap = new Map()
export const moduleFileToIdMap = new Map()
const nodeModulesInfoMap = new Map<string, NodeModuleInfo>()
const nodeModulesFileMap = new Map()
const viteOptimizedMap = new Map()
const aliasPathMap = new Map()
export const moduleRE = /^\/@modules\//;
export const supportedExts = ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'];
export const mainFields = ['module', 'jsnext', 'jsnext:main', 'browser', 'main'];

const debug = require('debug')('vite:resolve')
const isWin = require('os').platform() === 'win32'
const pathSeparator = isWin ? '\\' : '/'

interface RequestToFileOptions {
  publicPath: string,
  root: string,
  alias: Record<string, string>
}

export const defaultRequestToFile = ({
  root, 
  publicPath, 
  alias={}
}: RequestToFileOptions): string => {
  // 如果是 /@modules/ 路径
  if (moduleRE.test(publicPath)) {
    const id = publicPath.replace(moduleRE, '')
    // 从缓存中获取，如果有的话
    const cachedNodeModule = moduleIdToFileMap.get(id)
    if (cachedNodeModule) {
      return cachedNodeModule
    }
    // 从优化缓存中获取，如果有的话
    const optimizedModule = resolveOptimizedModule(root, id)
    if (optimizedModule) {
      return optimizedModule
    }
    // 从node_modules中加载
    const nodeModule = resolveNodeModuleFile(root, id)
    if (nodeModule) {
      moduleIdToFileMap.set(id, nodeModule)
      return nodeModule
    }
  }

  // 如果alias路径
  let aliaPublicPath = aliasPathMap.get(publicPath)
  if(aliaPublicPath){
    return aliaPublicPath;
  }
  for (const key in alias) {
    if(publicPath.startsWith(key)){
      aliaPublicPath = path.join(
         alias[key],
         publicPath.slice(key.length)
      )
    }
  }
  if(aliaPublicPath){
    aliasPathMap.set(publicPath, aliaPublicPath);
    return aliaPublicPath;
  }

  // 尝试从public目录加载
  const publicDirPath = path.join(root, 'public', publicPath.slice(1))
  if (fs.existsSync(publicDirPath)) {
    return publicDirPath
  }

  // 如果都没有，则正常拼接
  return path.join(root, publicPath.slice(1))
}

export interface FileToRequestOptions {
  filePath: string
  root: string
}

export const defaultFileToRequest = ({
  filePath, 
  root
}: FileToRequestOptions): string =>{
  return moduleFileToIdMap.get(filePath) ||
  '/' + slash(path.relative(root, filePath)).replace(/^public\//, '')
}
  

const isFile = (file: string): boolean => {
  try {
    return fs.statSync(file).isFile()
  } catch (e) {
    return false
  }
}

/**
 * this function resolve fuzzy file path. examples:
 * /path/file is a fuzzy file path for /path/file.tsx
 * /path/dir is a fuzzy file path for /path/dir/index.js
 *
 * returning undefined indicates the filePath is not fuzzy:
 * it is already an exact file path, or it can't match any file
 */
export const resolveFilePathPostfix = (filePath: string): string | undefined => {
  const cleanPath = cleanUrl(filePath)
  if (!isFile(cleanPath)) {
    let postfix = ''
    for (const ext of supportedExts) {
      if (isFile(cleanPath + ext)) {
        postfix = ext
        break
      }
      const defaultFilePath = `/index${ext}`
      if (isFile(path.join(cleanPath, defaultFilePath))) {
        postfix = defaultFilePath
        break
      }
    }
    const queryMatch = filePath.match(/\?.*$/)
    const query = queryMatch ? queryMatch[0] : ''
    const resolved = cleanPath + postfix + query
    if (resolved !== filePath) {
      debug(`(postfix) ${filePath} -> ${resolved}`)
      return postfix
    }
  }
}

export const isDir = (p: string) => fs.existsSync(p) && fs.statSync(p).isDirectory()

export function resolveOptimizedModule(
  root: string,
  id: string
): string | undefined {
  const cacheKey = `${root}#${id}`
  const cached = viteOptimizedMap.get(cacheKey)
  if (cached) {
    return cached
  }

  const cacheDir = resolveOptimizedCacheDir(root)
  if (!cacheDir) return

  const tryResolve = (file: string) => {
    file = path.join(cacheDir, file)
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      viteOptimizedMap.set(cacheKey, file)
      return file
    }
  }

  return tryResolve(id) || tryResolve(id + '.js')
}


export function resolveNodeModule(
  root: string,
  id: string,
  resolver: Resolver
): NodeModuleInfo | undefined {
  const cacheKey = `${root}#${id}`
  const cached = nodeModulesInfoMap.get(cacheKey)
  if (cached) {
    return cached
  }
  let pkgPath
  try {
    // see if the id is a valid package name
    pkgPath = resolveFrom(root, `${id}/package.json`)
  } catch (e) {
    debug(`failed to resolve package.json for ${id}`)
  }

  if (pkgPath) {
    // if yes, this is a entry import. resolve entry file
    let pkg
    try {
      pkg = fs.readJSONSync(pkgPath)
    } catch (e) {
      return
    }
    let entryPoint: string | undefined

    // TODO properly support conditional exports
    // https://nodejs.org/api/esm.html#esm_conditional_exports
    // Note: this would require @rollup/plugin-node-resolve to support it too
    // or we will have to implement that logic in vite's own resolve plugin.

    if (!entryPoint) {
      for (const field of mainFields) {
        if (typeof pkg[field] === 'string') {
          entryPoint = pkg[field]
          break
        }
      }
    }

    if (!entryPoint) {
      entryPoint = 'index.js'
    }

    // resolve object browser field in package.json
    // https://github.com/defunctzombie/package-browser-field-spec
    const { browser: browserField } = pkg
    if (entryPoint && browserField && typeof browserField === 'object') {
      entryPoint = mapWithBrowserField(entryPoint, browserField)
    }

    debug(`(node_module entry) ${id} -> ${entryPoint}`)

    // save resolved entry file path using the deep import path as key
    // e.g. foo/dist/foo.js
    // this is the path raw imports will be rewritten to, and is what will
    // be passed to resolveNodeModuleFile().
    let entryFilePath: string | undefined

    // respect user manual alias
    const aliased = resolver.alias(id)
    if (aliased && aliased !== id) {
      entryFilePath = resolveNodeModuleFile(root, aliased)
    }

    if (!entryFilePath && entryPoint) {
      // #284 some packages specify entry without extension...
      entryFilePath = path.join(path.dirname(pkgPath), entryPoint!)
      const postfix = resolveFilePathPostfix(entryFilePath)
      if (postfix) {
        entryPoint += postfix
        entryFilePath += postfix
      }
      entryPoint = path.posix.join(id, entryPoint!)
      // save the resolved file path now so we don't need to do it again in
      // resolveNodeModuleFile()
      nodeModulesFileMap.set(entryPoint, entryFilePath)
    }

    const result: NodeModuleInfo = {
      entry: entryPoint!,
      entryFilePath,
      pkg
    }
    nodeModulesInfoMap.set(cacheKey, result)
    return result
  }
}


export function resolveNodeModuleFile(
  root: string,
  id: string
): string | undefined {
  const cacheKey = `${root}#${id}`
  const cached = nodeModulesFileMap.get(cacheKey)
  if (cached) {
    return cached
  }
  try {
    const resolved = resolveFrom(root, id)
    nodeModulesFileMap.set(cacheKey, resolved)
    return resolved
  } catch (e) {
    // error will be reported downstream
  }
}

/**
 * given a relative path in pkg dir,
 * return a relative path in pkg dir,
 * mapped with the "map" object
 */
const normalize = path.posix.normalize;
function mapWithBrowserField(
  relativePathInPkgDir: string,
  map: Record<string, string>
) {
  const normalized = normalize(relativePathInPkgDir)
  const foundEntry = Object.entries(map).find(
    ([from]) => normalize(from) === normalized
  )
  if (!foundEntry) {
    return normalized
  }
  const [, to] = foundEntry
  return normalize(to)
}