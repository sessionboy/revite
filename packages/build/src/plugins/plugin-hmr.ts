import { createRequire } from "module"
import { Plugin, ReviteConfig, PluginOptions } from "@revite/types"
import { scriptReg } from "./config.js"
import { getHmrCode } from "./util.js"

const require = createRequire(import.meta.url);
const babel = require('@babel/core');

export default async (options: PluginOptions): Promise<Plugin> => {
  return {
    name: "@revite/plugin-hmr",
    filter: scriptReg,
    transform: async ({ fileContents, filePath })=> {
      let { code } = await babel.transformAsync(fileContents, {
        ast: false,
        compact: false,
        sourceMaps: false,
        configFile: false,
        babelrc: false,
        plugins: [
          require('react-refresh/babel'), 
          require('@babel/plugin-proposal-class-properties')
        ],
      });
      const _code = getHmrCode(filePath, code);      
      return { fileContents: _code }
    }
  }
}