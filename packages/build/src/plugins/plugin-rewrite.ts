import { relative, join, dirname, extname } from "path"
import { createRequire } from "module"
import { Plugin, PluginOptions } from "@revite/types"
import { isBare } from "@revite/utils"
import { scriptReg, styleReg, mediaReg } from "./config.js"
import { 
  scanCodeImportsExports, 
  matchDynamicImportValue 
} from "../rewrite-imports.js"

const require = createRequire(import.meta.url);

function spliceString(source: string, withSlice: string, start: number, end: number) {
  return source.slice(0, start) + (withSlice || '') + source.slice(end);
}

export default async ({ config }: PluginOptions): Promise<Plugin> => {
  return {
    name: "@revite/plugin-rewrite",
    filter: scriptReg,
    transform: async ({ fileContents, filePath, fileExt, outputPath })=> {
      const metaJson = require(config.build.metaPath);
      const imports = await scanCodeImportsExports(fileContents);
      let rewrittenCode = fileContents;
      if(imports.length == 0) {
        return fileContents;
      }
      for (const _import of imports.reverse()) {
        let spec = fileContents.substring(_import.s, _import.e);
        if (_import.d > -1) {                   
          spec = matchDynamicImportValue(spec) || '';
        }
        // 裸模块，例如react、react-dom
        if(isBare(spec)){
          const modulePath = metaJson.imports[spec];
          if(modulePath){
            const relativePath = relative(
              dirname(outputPath),
              config.build.packagesDir
            );
            const _path = join(relativePath, modulePath);            
            rewrittenCode = spliceString(rewrittenCode, _path, _import.s, _import.e);
          }else{
            // 未优化的裸模块
          }            
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
          if (_import.d > -1) {
            _path = JSON.stringify(_path);
          }
          rewrittenCode = spliceString(rewrittenCode, _path, _import.s, _import.e);
        }         
      }
      return { fileContents: rewrittenCode };
    }
  }
}
