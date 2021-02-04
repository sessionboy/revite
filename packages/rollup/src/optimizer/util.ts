import fs from 'fs'
import path from 'path'
import { createHash } from 'crypto'
import { lookupFile } from "@revite/utils"
import { OPTIMIZE_CACHE_DIR } from "./config.js"

/* 获取缓存目录 */ 
const cacheDirCache = new Map<string, string | null>();
export function resolveOptimizedCacheDir(
  root: string,
  pkgPath?: string
): string | null {
  const cached = cacheDirCache.get(root)
  if (cached !== undefined) return cached
  pkgPath = pkgPath || lookupFile(root, [`package.json`], true /* pathOnly */)
  if (!pkgPath) {
    return null
  }
  const cacheDir = path.join(path.dirname(pkgPath), OPTIMIZE_CACHE_DIR)
  cacheDirCache.set(root, cacheDir)
  return cacheDir
}

/* 获取或更改缓存hash */ 
const lockfileFormats = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml']
let cachedHash: string | undefined
export function getDepHash(
  root: string,
  configPath: string | undefined
): string {
  if (cachedHash) {
    return cachedHash
  }
  let content = lookupFile(root, lockfileFormats) || ''
  const pkg = JSON.parse(lookupFile(root, [`package.json`]) || '{}')
  content += JSON.stringify(pkg.dependencies)
  // also take config into account
  if (configPath) {
    content += fs.readFileSync(configPath, 'utf-8')
  }
  return createHash('sha1').update(content).digest('base64')
}
