import { readFileSync } from "fs"
import { extname } from "path"
import esbuild from "esbuild"
import { Plugin, PluginOptions } from "@revite/types"
// import { Plugin } from "../types.js"
import { scriptReg } from "./config.js"
import { handleEsbuildError, cleanStack } from "../error.js"
const { startService } = esbuild; 

const splitRE = /\r?\n/
export function pad(source: string, n = 2) {
  const lines = source.split(splitRE)
  return lines.map((l) => ` `.repeat(n) + l).join(`\n`)
}

const getLoader = (filePath: string): 'js' | 'jsx' | 'ts' | 'tsx' => {
  const ext = extname(filePath);
  if (ext === '.mjs') {
    return 'js';
  }
  return ext.substr(1) as 'jsx' | 'ts' | 'tsx';
}

const cacheCode = new Map();
export default (options:any): Plugin => {
  return {
    name: "@revite/plugin-esm",
    filter: scriptReg,
    load: async (filePath: string)=> {
      const service = await startService();
      const contents = readFileSync(filePath,"utf8");

      const cacheContents = cacheCode.get(contents);
      if(cacheContents){
        return cacheContents;
      }

      // 缓存文件内容，以便启动时过滤未更改且已编译的文件
      // config.cache(filePath, contents);
      
      try {
        const result = await service.transform(contents, {
          loader: getLoader(filePath)
        });
        cacheCode.set(contents, result);
        return result;
      } catch (e) {   
        // const err = handleEsbuildError({ err: e, filePath, contents,log })        
        // if(err.frame){          
        //   dispacthError({ 
        //     title: "Build error: @revite/plugin-esm",
        //     errorMessage: err.frame,
        //     fileLoc: filePath,
        //     errorStackTrace: err.stack            
        //   });
        //   throw cleanStack(err.stack);
        // }
        throw e;
      } finally {
        service.stop();
      }
    }
  }
}