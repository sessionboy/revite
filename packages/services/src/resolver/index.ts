import path from "path"
import slash from "slash";
import { resolveOptimizedCacheDir } from "@revite/rollup"
import { ResolverOptions } from "../types.js"
import { 
  queryRE, 
  cleanUrl, 
  lookupFile,
  isStaticAsset,
  parseNodeModuleId 
} from "@revite/utils"
import { 
  isDir,
  moduleRE,
  defaultRequestToFile,
  defaultFileToRequest,
  resolveFilePathPostfix
} from "./util.js"

const requestToFileCache = new Map<string, string>()
const fileToRequestCache = new Map<string, string>()

export const clientPublicPath = `/revite/client`

export default class Resolver {
  // 项目的根目录
  root: string;
  // 用户自定义的resolver
  resolvers: Resolver[];
  // 用户自定义的alias
  userAlias?: Record<string, string> = {};
  // 用户定义的资源列表 
  assetsInclude?: (file: string) => boolean;
  literalAlias: Record<string, string> = {};
  literalDirAlias: Record<string, string> = {};

  constructor(options: ResolverOptions){
    this.root = options.root;
    this.resolvers = options.resolvers||[];
    this.assetsInclude = options.assetsInclude;
    this.userAlias = this.resolveAlias(options.userAlias||{});
  }

  // 解析alias
  resolveAlias(alias: Record<string, string>){
    const _alias: Record<string, string> = {};
    for (const key in alias) {
      let target = alias[key]
      // aliasing a directory
      if (key.startsWith('/') && key.endsWith('/') && path.isAbsolute(target)) {
        // check first if this is aliasing to a path from root
        const fromRoot = path.join(this.root, target)
        if (isDir(fromRoot)) {
          target = fromRoot
        } else if (!isDir(target)) {
          continue
        }        
        _alias[key] = target;
        this.literalDirAlias[key] = target;
      } else {
        this.literalAlias[key] = target;
      }
    }
    return _alias;
  }

  /*
    * 根据模块请求的路径解析出对应的模块文件路径
    * 例如： /pages/404.tsx -->  /Volumes/works/revite/src/pages/404.tsx
    * @publicPath 需要解析的路径
    * @root  根路径
  */   
  requestToFile(publicPath: string){
    publicPath = decodeURIComponent(publicPath)
    if (requestToFileCache.has(publicPath)) {
      return requestToFileCache.get(publicPath)!
    }
    let resolved = defaultRequestToFile({
      root: this.root,
      publicPath, 
      alias: this.userAlias||{}
    });
    const postfix = resolveFilePathPostfix(resolved)
    if (postfix) {
      if (postfix[0] === '/') {
        resolved = path.join(resolved, postfix)
      } else {
        resolved += postfix
      }
    }
    requestToFileCache.set(publicPath, resolved)
    return resolved
  }


   /*
    * 根据模块文件路径解析出对应的模块请求的路径
    * 例如：/Volumes/works/revite/src/pages/404.tsx --> /pages/404.tsx
    * @publicPath 需要解析的路径
    * @root  根路径
  */   
  fileToRequest(filePath: string){
    if (fileToRequestCache.has(filePath)) {
      return fileToRequestCache.get(filePath)!
    }
    const res = defaultFileToRequest({
      filePath, 
      root: this.root
    })
    fileToRequestCache.set(filePath, res)
    return res
  }

  // 处理加载模块拓展名
  normalizePublicPath(publicPath: string){
    if (publicPath === clientPublicPath) {
      return publicPath
    }
    // preserve query
    const queryMatch = publicPath.match(/\?.*$/)
    const query = queryMatch ? queryMatch[0] : ''
    const cleanPublicPath = cleanUrl(publicPath)

    const finalize = (result: string) => {
      result += query
      if (
        this.requestToFile(result) !== this.requestToFile(publicPath)
      ) {
        throw new Error(
          `[revite] normalizePublicPath check fail. please report to revite.`
        )
      }
      return result
    }

    if (!moduleRE.test(cleanPublicPath)) {
      return finalize(
        this.fileToRequest(this.requestToFile(cleanPublicPath))
      )
    }

    const filePath = this.requestToFile(cleanPublicPath)
    const cacheDir = resolveOptimizedCacheDir(this.root)
    if (cacheDir) {
      const relative = path.relative(cacheDir, filePath)
      if (!relative.startsWith('..')) {
        return finalize(path.posix.join('/@modules/', slash(relative)))
      }
    }

    // fileToRequest doesn't work with files in node_modules
    // because of edge cases like symlinks or yarn-aliased-install
    // or even aliased-symlinks

    // example id: "@babel/runtime/helpers/esm/slicedToArray"
    // see the test case: /playground/TestNormalizePublicPath.vue
    const id = cleanPublicPath.replace(moduleRE, '')
    const { scope, name, inPkgPath } = parseNodeModuleId(id)
    if (!inPkgPath) return publicPath
    let filePathPostFix = ''
    let findPkgFrom = filePath
    while (!filePathPostFix.startsWith(inPkgPath)) {
      // some package contains multi package.json...
      // for example: @babel/runtime@7.10.2/helpers/esm/package.json
      const pkgPath = lookupFile(findPkgFrom, ['package.json'], true)
      if (!pkgPath) {
        throw new Error(
          `[revite] can't find package.json for a node_module file: ` +
            `"${publicPath}". something is wrong.`
        )
      }
      filePathPostFix = slash(path.relative(path.dirname(pkgPath), filePath))
      findPkgFrom = path.join(path.dirname(pkgPath), '../')
    }
    return finalize(
      ['/@modules', scope, name, filePathPostFix].filter(Boolean).join('/')
    )
  }

  // 处理模块别名
  alias(id: string): string{
    let aliased: string | undefined = this.literalAlias[id]
    if (aliased) {
      return aliased
    }
    return id;
  }

  // 处理相对路径
  resolveRelativeRequest(importer: string, importee: string){
    const queryMatch = importee.match(queryRE)
    let resolved = importee

    if (importee.startsWith('.')) {
      resolved = path.posix.resolve(path.posix.dirname(importer), importee)
      for (const alias in this.literalDirAlias) {
        if (importer.startsWith(alias)) {
          if (!resolved.startsWith(alias)) {
            // resolved path is outside of alias directory, we need to use
            // its full path instead
            const importerFilePath = this.requestToFile(importer)
            const importeeFilePath = path.resolve(
              path.dirname(importerFilePath),
              importee
            )
            resolved = this.fileToRequest(importeeFilePath)
          }
          break
        }
      }
    }

    return {
      pathname:
        cleanUrl(resolved) +
        // path resolve strips ending / which should be preserved
        (importee.endsWith('/') && !resolved.endsWith('/') ? '/' : ''),
      query: queryMatch ? queryMatch[0] : ''
    }
  }

  // 判断是否是请求public目录的文件
  isPublicRequest(publicPath: string){
    return this.requestToFile(publicPath)
    .startsWith(path.resolve(this.root, 'public'))
  }

  // 是否是请求asset的文件
  isAssetRequest(filePath: string) {
    return (
      (this.assetsInclude && this.assetsInclude(filePath)) || isStaticAsset(filePath)
    )
  }
}