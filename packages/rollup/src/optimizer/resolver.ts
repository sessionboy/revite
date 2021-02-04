import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import { lookupFile } from "@revite/utils"
import { init, parse } from 'es-module-lexer'
import { supportedExts } from "@revite/config"
import { Resolver, resolveNodeModule } from "@revite/services"
import { DepOptimizationOptions,FilteredDeps } from "./type.js"

const debug = require('debug')('vite:optimize')

const KNOWN_IGNORE_LIST = new Set([
  'vite',
  'vitepress',
  'tailwindcss',
  '@tailwindcss/ui',
  '@pika/react',
  '@pika/react-dom'
])

export function resolveQualifiedDeps(
  root: string,
  options: DepOptimizationOptions,
  resolver: Resolver
): FilteredDeps {
  const { include, exclude, link } = options
  // 找到项目的package.json
  const pkgContent = lookupFile(root, ['package.json'])
  if (!pkgContent) {
    return {
      qualified: {},
      external: []
    }
  }

  const pkg = JSON.parse(pkgContent)
  // 找到项目的依赖
  const deps = Object.keys(pkg.dependencies || {})
  const qualifiedDeps = deps.filter((id) => {
    if (include && include.includes(id)) {
      // already force included
      return false
    }
    if (exclude && exclude.includes(id)) {
      debug(`skipping ${id} (excluded)`)
      return false
    }
    if (link && link.includes(id)) {
      debug(`skipping ${id} (link)`)
      return false
    }
    if (KNOWN_IGNORE_LIST.has(id)) {
      debug(`skipping ${id} (internal excluded)`)
      return false
    }
    // #804
    if (id.startsWith('@types/')) {
      debug(`skipping ${id} (ts declaration)`)
      return false
    }
    // 查找依赖的package.json
    const pkgInfo = resolveNodeModule(root, id, resolver)
    if (!pkgInfo || !pkgInfo.entryFilePath) {
      debug(`skipping ${id} (cannot resolve entry)`)
      console.log(root, id)
      console.error(
        chalk.yellow(
          `[revite] cannot resolve entry for dependency ${chalk.cyan(id)}.`
        )
      )
      return false
    }
    // 查找依赖的入口文件
    const { entryFilePath } = pkgInfo
    if (!supportedExts.includes(path.extname(entryFilePath))) {
      debug(`skipping ${id} (entry is not js)`)
      return false
    }
    if (!fs.existsSync(entryFilePath)) {
      debug(`skipping ${id} (entry file does not exist)`)
      console.error(
        chalk.yellow(
          `[revite] dependency ${id} declares non-existent entry file ${entryFilePath}.`
        )
      )
      return false
    }
    // 读取依赖入口文件
    const content = fs.readFileSync(entryFilePath, 'utf-8');
    // 
    const [imports, exports] = parse(content);
    if (!exports.length && !/export\s+\*\s+from/.test(content)) {
      debug(`optimizing ${id} (no exports, likely commonjs)`)
      return true
    }
    for (const { s, e } of imports) {
      let i = content.slice(s, e).trim()
      i = resolver.alias(i) || i
      if (i.startsWith('.')) {
        debug(`optimizing ${id} (contains relative imports)`)
        return true
      }
      if (!deps.includes(i)) {
        debug(`optimizing ${id} (imports sub dependencies)`)
        return true
      }
    }
    debug(`skipping ${id} (single esm file, doesn't need optimization)`)
  })

  const qualified: Record<string, string> = {}
  qualifiedDeps.forEach((id) => {
    qualified[id] = resolveNodeModule(root, id, resolver)!.entryFilePath!
  })

  // mark non-optimized deps as external
  const external = deps
    .filter((id) => !qualifiedDeps.includes(id))
    // make sure aliased deps are external
    // https://github.com/vitejs/vite-plugin-react/issues/4
    .map((id) => resolver.alias(id) || id)

  return {
    qualified,
    external
  }
}