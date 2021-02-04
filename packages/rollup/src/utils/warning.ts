import { Ora } from 'ora'
import {
  rollup as Rollup,
  InputOptions
} from 'rollup'
import chalk from "chalk"
import { lookupFile } from "@revite/utils"
import { createRequire } from "module"
const require = createRequire(import.meta.url);
const isBuiltin = require('isbuiltin')

const warningIgnoreList = [`CIRCULAR_DEPENDENCY`, `THIS_IS_UNDEFINED`]
const dynamicImportWarningIgnoreList = [
  `Unsupported expression`,
  `statically analyzed`
]

// 处理打包警告
export function onRollupWarning(
  spinner: Ora | undefined,
  options?: any
): InputOptions['onwarn'] {
  return (warning, warn) => {
    if (warning.code === 'UNRESOLVED_IMPORT') {
      let message: string
      const id:any = warning.source
      const importer:any = warning.importer
      if (isBuiltin(id)) {
        let importingDep
        if (importer) {
          const pkg = JSON.parse(lookupFile(importer, ['package.json']) || `{}`)
          if (pkg.name) {
            importingDep = pkg.name
          }
        }
        // const allowList = options.allowNodeBuiltins
        // if (importingDep && allowList && allowList.includes(importingDep)) {
        //   return
        // }
        const dep = importingDep
          ? `Dependency ${chalk.yellow(importingDep)}`
          : `A dependency`
        message =
          `${dep} is attempting to import Node built-in module ${chalk.yellow(
            id
          )}.\n` +
          `This will not work in a browser environment.\n` +
          `Imported by: ${chalk.gray(importer)}`
      } else {
        message =
          `[vite]: Rollup failed to resolve import "${warning.source}" from "${warning.importer}".\n` +
          `This is most likely unintended because it can break your application at runtime.\n` +
          `If you do want to externalize this module explicitly add it to\n` +
          `\`rollupInputOptions.external\``
      }
      if (spinner) {
        spinner.stop()
      }
      throw new Error(message)
    }
    if (
      warning.plugin === 'rollup-plugin-dynamic-import-variables' &&
      dynamicImportWarningIgnoreList.some((msg) =>
        warning.message.includes(msg)
      )
    ) {
      return
    }

    if (!warningIgnoreList.includes(warning.code!)) {
      // ora would swallow the console.warn if we let it keep running
      // https://github.com/sindresorhus/ora/issues/90
      if (spinner) {
        spinner.stop()
      }
      warn(warning)
      if (spinner) {
        spinner.start()
      }
    }
  }
}

