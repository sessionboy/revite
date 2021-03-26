import { createRequire } from "module"
import { Plugin, InternalConfig, PluginOptions } from "@revite/types"
// import { Plugin } from "../types.js"
import { scriptReg } from "./config.js"
import { getHmrCode } from "./util.js"

const require = createRequire(import.meta.url);
const babel = require('@babel/core');

const cacheHtml = new Map();
export default (options: any): Plugin => {
  return {
    name: "@revite/plugin-hmr",
    filter: scriptReg,
    transform: async ({ fileContents, filePath })=> {
      const cacheContents = cacheHtml.get(fileContents);
      if(cacheContents){
        return { fileContents: cacheContents }
      }
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
      cacheHtml.set(fileContents,fileContents); 
      return { fileContents: _code }
    }
  }
}