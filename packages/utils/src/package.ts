import fs from "fs"
import path from "path"
import { Readable } from 'stream'
import resolve from 'resolve'
import { resolve as resolveExports, legacy } from 'resolve.exports';
import { createRequire } from 'module'
import { isObject } from "./common.js"

export const bareImportRE = /^[\w@](?!.*:\/\/)/
export const deepImportRE = /^([^@][^/]*)\/|^(@[^/]+\/[^/]+)\//

export const findPackagePath = (id: string, basedir: string) =>{
  const deepMatch = id.match(deepImportRE);
  const pkgId = deepMatch ? deepMatch[1] || deepMatch[2] : id;
  const pkg:any = resolvePackageData(pkgId, basedir)
  if (!pkg) return;
  let resolved = deepMatch
    ? resolveDeepImport(id, pkg)
    : resolvePackageEntry(id, pkg)
  return resolved;
}

export const resolvePackageData = (id:string, basedir: string) =>{
  try {
    const pkgPath = resolveFrom(`${id}/package.json`, basedir);
    return require(pkgPath);
  } catch (e) {
    throw e;
  }
}

export const resolvePackageEntry = (id:string, pkg: any) =>{
  let entryPoint: string | undefined | void

  // resolve exports field with highest priority
  // using https://github.com/lukeed/resolve.exports
  if (pkg.exports) {
    entryPoint = resolveExports(pkg, '.')
  }

  if(!entryPoint || entryPoint.endsWith('.mjs')){
    const browserEntry =
      typeof pkg.browser === 'string'
        ? pkg.browser
        : isObject(pkg.browser) && pkg.browser['.']

    if(!pkg.module){
      entryPoint = pkg.main;
    }
    else if(pkg.module && !pkg.browser){
      entryPoint = pkg.module;
    }
    else if(pkg.module && pkg.browser){
      if(typeof pkg.browser === 'string'){
        entryPoint = pkg.browser;
      }else{
        if(pkg.browser[pkg.module]){

        }
      }
      entryPoint =
        typeof pkg.browser === 'string'
          ? pkg.browser
          : isObject(pkg.browser) && pkg.browser['.']
    }

  }

  entryPoint = entryPoint || pkg.main || 'index.js';


  // if (!entryPoint || entryPoint.endsWith('.mjs')) {
  //   // check browser field
  //   // https://github.com/defunctzombie/package-browser-field-spec
  //   const browserEntry =
  //     typeof pkg.browser === 'string'
  //       ? pkg.browser
  //       : isObject(pkg.browser) && pkg.browser['.']
  //   if (browserEntry) {
  //     // check if the package also has a "module" field.
  //     if (typeof pkg.module === 'string' && pkg.module !== browserEntry) {
  //       // if both are present, we may have a problem: some package points both
  //       // to ESM, with "module" targeting Node.js, while some packages points
  //       // "module" to browser ESM and "browser" to UMD.
  //       // the heuristics here is to actually read the browser entry when
  //       // possible and check for hints of UMD. If it is UMD, prefer "module"
  //       // instead; Otherwise, assume it's ESM and use it.
  //       const resolvedBrowserEntry = tryFsResolve(
  //         path.join(dir, browserEntry),
  //         options
  //       )
  //       if (resolvedBrowserEntry) {
  //         const content = fs.readFileSync(resolvedBrowserEntry, 'utf-8')
  //         if (
  //           (/typeof exports\s*==/.test(content) &&
  //             /typeof module\s*==/.test(content)) ||
  //           /module\.exports\s*=/.test(content)
  //         ) {
  //           // likely UMD or CJS(!!! e.g. firebase 7.x), prefer module
  //           entryPoint = pkg.module
  //         }
  //       }
  //     } else {
  //       entryPoint = browserEntry
  //     }
  //   }
  // }
}

export const resolveDeepImport = (id:string, basedir: string) =>{
  return "";
}


export let isRunningWithYarnPnp: boolean
try {
  isRunningWithYarnPnp = Boolean(require('pnpapi'))
} catch {}

export const DEFAULT_EXTENSIONS = ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
export function resolveFrom(id: string, basedir: string, extensions?:string[]) {
  return resolve.sync(id, {
    basedir,
    extensions: extensions||DEFAULT_EXTENSIONS,
    // necessary to work with pnpm
    preserveSymlinks: isRunningWithYarnPnp || false
  })
}
