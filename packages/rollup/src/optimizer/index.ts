import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import { rollup } from 'rollup'
import { init, parse } from 'es-module-lexer'
import { lookupFile,resolveFrom } from "@revite/utils"
import { 
  getDepHash,
  resolveOptimizedCacheDir 
} from "./util.js"
import { 
  Resolver,
  resolveNodeModule,
  resolveNodeModuleFile 
} from "@revite/services"
import { resolveQualifiedDeps } from "./resolver.js"
import { onRollupWarning } from "../utils/warning.js"
import {
  createDepAssetPlugin,
  createDepAssetExternalPlugin
} from './pluginAssets.js'
import { entryAnalysisPlugin } from './entryAnalysisPlugin.js'
// import { createBaseRollupPlugins } from "../build/basePlugins"

export * from "./util.js";

const debug = require('debug')('vite:optimize')

export const optimize = async (config:any, isDebug = false) =>{

  // const resolver = new Resolver({ 
  //   root: config.root,
  //   userAlias: config.alias,
  // })
  // const filePath = resolver.requestToFile("/pages/404.tsx");
  // // const filePath = resolver.requestToFile("/@modules/react");
  // // const filePath = resolver.requestToFile("/logo512.png");
  // console.log(filePath);
  // return;

  const log = isDebug ? debug : console.log;
  const root = config.root || process.cwd();
  const pkgPath = lookupFile(root, [`package.json`], true /* pathOnly */)
  if (!pkgPath) {
    log(`package.json not found. Skipping.`)
    return
  }

  /* 处理缓存目录 */ 
  const cacheDir = resolveOptimizedCacheDir(root, pkgPath)!
  const hashPath = path.join(cacheDir, 'hash')
  const depHash = getDepHash(root, config.__path)
  if (!config.force) {
    let prevhash
    try {
      prevhash = await fs.readFile(hashPath, 'utf-8')
    } catch (e) {}
    // hash is consistent, no need to re-bundle
    if (prevhash === depHash) {
      log('Hash is consistent. Skipping. Use --force to override.')
      return
    }
  }
  await fs.remove(cacheDir)
  await fs.ensureDir(cacheDir)

  /* 处理缓存目录 */ 
  const options = config.optimizeDeps || {}
  const resolver = new Resolver({ 
    root: config.root,
    userAlias: config.alias
  })
  await init;

  /* 解析依赖 */ 
  const { qualified, external } = resolveQualifiedDeps(root, options, resolver);

  // Resolve deps from linked packages in a monorepo
  if (options.link) {
    options.link.forEach((linkedDep:any) => {
      const depRoot = path.dirname(
        resolveFrom(root, `${linkedDep}/package.json`)
      )
      const { qualified: q, external: e } = resolveQualifiedDeps(
        depRoot,
        options,
        resolver
      )
      Object.keys(q).forEach((id) => {
        if (!qualified[id]) {
          qualified[id] = q[id]
        }
      })
      e.forEach((id) => {
        if (!external.includes(id)) {
          external.push(id)
        }
      })
    })
  }

  // Force included deps - these can also be deep paths
  if (options.include) {
    options.include.forEach((id:any) => {
      const pkg = resolveNodeModule(root, id, resolver)
      if (pkg && pkg.entryFilePath) {
        qualified[id] = pkg.entryFilePath
      } else {
        const filePath = resolveNodeModuleFile(root, id)
        if (filePath) {
          qualified[id] = filePath
        }
      }
    })
  }

  if (!Object.keys(qualified).length) {
    await fs.writeFile(hashPath, depHash)
    log(`No listed dependency requires optimization. Skipping.`)
    return
  }

  if (!isDebug) {
    // This is auto run on server start - let the user know that we are
    // pre-optimizing deps
    console.log(chalk.greenBright(`[revite] Optimizable dependencies detected:`))
    console.log(
      Object.keys(qualified)
        .map((id) => chalk.yellow(id))
        .join(`, `)
    )
  }

  let spinner;
  const msg = isDebug
    ? `Pre-bundling dependencies to speed up dev server page load...`
    : `Pre-bundling them to speed up dev server page load...\n` +
      `(this will be run only when your dependencies have changed)`
  if (process.env.DEBUG || process.env.NODE_ENV === 'test') {
    console.log(msg)
  } else {
    spinner = require('ora')(msg + '\n').start()
  }

  // optimize构建
  try {   
    const {
      pluginsPreBuild,
      pluginsPostBuild,
      pluginsOptimizer = [],
      ...rollupInputOptions
    } = config.rollupInputOptions || {}

    const bundle = await rollup({
      input: qualified,
      external,
      // treeshake: { moduleSideEffects: 'no-external' },
      onwarn: onRollupWarning(spinner, options),
      ...config.rollupInputOptions,
      plugins: [
        createDepAssetExternalPlugin(resolver),
        entryAnalysisPlugin({ root }),
        // ...(await createBaseRollupPlugins(root, resolver, config)),
        createDepAssetPlugin(resolver, root),
        ...pluginsOptimizer
      ]
    })

    const { output } = await bundle.generate({
      ...config.rollupOutputOptions,
      format: 'es',
      exports: 'named',
      entryFileNames: '[name].js',
      chunkFileNames: 'common/[name]-[hash].js'
    })

    spinner && spinner.stop()

    for (const chunk of output) {
      if (chunk.type === 'chunk') {
        const fileName = chunk.fileName
        const filePath = path.join(cacheDir, fileName)
        await fs.ensureDir(path.dirname(filePath))
        await fs.writeFile(filePath, chunk.code)
      }
      if (chunk.type === 'asset' && chunk.fileName === '_analysis.json') {
        const filePath = path.join(cacheDir, chunk.fileName)
        await fs.writeFile(filePath, chunk.source)
      }
    }

    await fs.writeFile(hashPath, depHash)
  } catch (e) {
    spinner && spinner.stop()
    if (isDebug) {
      throw e
    } else {
      console.error(chalk.red(`\n[vite] Dep optimization failed with error:`))
      console.error(chalk.red(e.message))
      if (e.code === 'PARSE_ERROR') {
        console.error(chalk.cyan(path.relative(root, e.loc.file)))
        console.error(chalk.dim(e.frame))
      } else if (e.message.match('Node built-in')) {
        console.log()
        console.log(
          chalk.yellow(
            `Tip:\nMake sure your "dependencies" only include packages that you\n` +
              `intend to use in the browser. If it's a Node.js package, it\n` +
              `should be in "devDependencies".\n\n` +
              `If you do intend to use this dependency in the browser and the\n` +
              `dependency does not actually use these Node built-ins in the\n` +
              `browser, you can add the dependency (not the built-in) to the\n` +
              `"optimizeDeps.allowNodeBuiltins" option in vite.config.js.\n\n` +
              `If that results in a runtime error, then unfortunately the\n` +
              `package is not distributed in a web-friendly format. You should\n` +
              `open an issue in its repo, or look for a modern alternative.`
          )
          // TODO link to docs once we have it
        )
      } else {
        console.error(e)
      }
      process.exit(1)
    }
  }
}