import { relative, join, dirname, extname } from "path"
import { createRequire } from "module"
import fs from "fs-extra"
import { Plugin } from "../types.js"
import { isBare, generateOutId, getFileWithExts } from "@revite/utils"
import { scriptReg, mediaReg } from "./config.js"
import { 
  scanCodeImportsExports, 
  matchDynamicImportValue 
} from "../rewrite-imports.js"
const { writeFile, ensureFileSync } = fs;

const require = createRequire(import.meta.url);

function spliceString(source: string, withSlice: string, start: number, end: number) {
  return source.slice(0, start) + (withSlice || '') + source.slice(end);
}

const exts = [".jsx",".tsx",".js",".ts"];

export default ({ config }: any): Plugin => {
  return {
    name: "@revite/plugin-rewrite",
    filter: scriptReg,
    async transform (code, id) {
      try {       
        const metaJson = require(config.build.metaPath);
        let rewrittenCode = code;
        const imports = await scanCodeImportsExports(code);
       
        if(imports.length == 0) {
          return { code };
        }

        for (const _import of imports.reverse()) {
          const { s, e, ss, se, d } = _import;
          let spec = rewrittenCode.substring(s, e);
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

            const _path = `/${config.build.packages}/${modulePath}`;            
            rewrittenCode = spliceString(rewrittenCode, _path, s, e);         
          }else{

            const baseDir = dirname(id);
            let _path = join(baseDir,spec);

            // 没有后缀的本地模块，例如 ../App 
            if(!extname(spec)){          
              const file = getFileWithExts(_path, exts);            
              if(!file){
                throw new Error(`Not found the file: \n ${_path}.${exts}`)
              }
            _path = file;
          }

            let relativePath = relative(config.root, _path);
            if(!relativePath.startsWith("/")){
              relativePath = `/${relativePath}`;
            }

            if(mediaReg.test(relativePath)){
              relativePath = relativePath+"?import"
            }
          
            // dynamic动态模块
            if (d > -1) {
              relativePath = JSON.stringify(relativePath);
            }
            rewrittenCode = spliceString(rewrittenCode, relativePath, s, e);
          }         
        }

        // if(config.write){
          const relativePath = relative(config.root, id);
          const outPath = join(config.build.clientDir,relativePath);
          console.log("relativePath", relativePath);
          console.log("outPath", outPath);
          ensureFileSync(outPath);
          writeFile(outPath, rewrittenCode);
        // }

        return { code: rewrittenCode };
      } catch (error) {
          console.log("rewrite:error", error);
      }
    }
  }
}
