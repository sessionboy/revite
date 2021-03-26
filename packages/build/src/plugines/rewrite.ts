import { createRequire } from "module"
import esbuild from "esbuild"
import { relative, join, dirname, extname } from "path"
import { existsSync, readFileSync } from "fs"
import { Plugin } from "../types.js"
import { isBare, generateOutId } from "@revite/utils"
import { scriptReg, styleReg, mediaReg } from "./config.js"
import { 
  scanCodeImportsExports, 
  matchDynamicImportValue 
} from "../rewrite-imports.js"

const require = createRequire(import.meta.url);

function spliceString(source: string, withSlice: string, start: number, end: number) {
  return source.slice(0, start) + (withSlice || '') + source.slice(end);
}

export default (config: any): Plugin => {
  return {
    name: "@revite/plugin-rewrite",
    filter: /.*/,
    async transform (code, id) {
      if(!scriptReg.test(id)) return;
      const metaJson = require(config.build.metaPath);
      const imports = await scanCodeImportsExports(code);
      let rewrittenCode = code;
      if(imports.length == 0) {
        return { code };
      }
      for (const _import of imports.reverse()) {
        const { s, e, ss, se, d } = _import;
        let spec = code.substring(s, e);
        if (d > -1) {                   
          spec = matchDynamicImportValue(spec) || '';
        }
        
        // 裸模块，例如react、react-dom
        if(isBare(spec)){
          let modulePath = metaJson[spec];
          if(!modulePath){
            // 未优化的裸模块
            modulePath = generateOutId(spec);
            // unOptimizes.push(spec);
          }       
          console.log();
          const _path = `/${config.build.packages}/${modulePath}`;;            
          rewrittenCode = spliceString(rewrittenCode, _path, s, e);         
        }else{
          let _path = spec;

          // 没有后缀的本地模块，例如 ../App，添加.js后缀        
          if(!extname(spec)){             
            _path = spec + ".js";
          }

          // css模块
          if(styleReg.test(spec)){
            if(spec.endsWith(".css")){
              _path = spec + ".proxy.js";
            }else{
              // 如果是.scss、.less等后缀，则转换为.css后缀
              const ext = extname(spec);
              _path = spec.replace(ext,".css") + ".proxy.js";
            }            
          }

          // 图片模块
          if(mediaReg.test(spec)){
            _path = spec + ".proxy.js";
          }
          
          // dynamic动态模块
          if (d > -1) {
            _path = JSON.stringify(_path);
          }
          rewrittenCode = spliceString(rewrittenCode, _path, s, e);
        }         
      }

      return {
        code: rewrittenCode
      }
    }
  }
}