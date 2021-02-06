import { readFileSync } from "fs"
import fsExtra from "fs-extra"
import esbuild from "esbuild"
import { Plugin, PluginOptions } from "@revite/types"
import { styleReg } from "./config.js"
import { getStyleHmrCode } from "./util.js"
import { handleEsbuildError,cleanStack } from "../error.js"
const { startService } = esbuild;
const { writeFileSync, existsSync, ensureFile } = fsExtra;

export default async ({ dispacthError, log }: PluginOptions): Promise<Plugin> => {
  return {
    name: "@revite/plugin-style",
    filter: styleReg,
    load: async (filePath: string)=> {
      const service = await startService();
      const contents = readFileSync(filePath,"utf8");
      
      // 缓存文件内容，以便启动时过滤未更改且已编译的文件
      // config.cache(filePath, contents);
      try {
        const result = await service.transform(contents, {
          loader: "css"
        });
        return result;
      } catch (e) {   
        const err = handleEsbuildError({ err: e, filePath, contents,log })        
        if(err.frame){          
          dispacthError({ 
            title: "Build error: @revite/plugin-esm",
            errorMessage: err.frame,
            fileLoc: filePath,
            errorStackTrace: err.stack            
          });
          throw cleanStack(err.stack);
        }
        throw e;
      } finally {
        service.stop();
      }
    },
    transform: async ({ fileContents, outputPath })=> {
      const _outputPath = outputPath+".proxy.js";
      const cssHmrCode = getStyleHmrCode(fileContents,_outputPath); 

      if(!existsSync(_outputPath)){
        await ensureFile(_outputPath);
      }
      writeFileSync(_outputPath, cssHmrCode);

      return { fileContents, outputPath: _outputPath };
    }
  }
}