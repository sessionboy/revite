import { createRequire } from "module"
import { Plugin } from "../types.js"
import { scriptReg } from "./config.js"
import { getHmrCode } from "./util.js"

const require = createRequire(import.meta.url);
const babel = require('@babel/core');

const cacheHtml = new Map();
export default (options: any): Plugin => {
  return {
    name: "@revite/plugin-hmr",
    filter: scriptReg,
    transform: async (code, id)=> {
      const cacheContents = cacheHtml.get(code);
      if(cacheContents){
        return { code: cacheContents }
      }
      let result = await babel.transformAsync(code, {
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
      const _code = getHmrCode(id, result.code);     
      cacheHtml.set(code, _code); 
      return { code: _code }
    }
  }
}