import fsExtra from "fs-extra"
import { relative } from "path"
import { Plugin, PluginOptions } from "@revite/types"
import { mediaReg } from "./config.js"
const { writeFileSync, existsSync, ensureFile, copyFileSync } = fsExtra;

export default async ({ config }: PluginOptions): Promise<Plugin> => {
  return {
    name: "@revite/plugin-media",
    filter: mediaReg,
    write: false,
    load: async (filePath: string)=> {     
      const code = "export default $url;"
      // 缓存文件内容，以便启动时过滤未更改且已编译的文件
      // config.cache(filePath, code);
      return {
        code,
        warnings:[]
      };
    },
    transform: async ({ fileContents, filePath, outputPath })=> {
      const _outputPath = outputPath+".proxy.js";
      let relativePath = relative(config.buildOptions.clientDir, outputPath);      
      if(!relativePath.startsWith("./")||!relativePath.startsWith("../")){
        relativePath = "/client/" + relativePath;
      }           
      fileContents = fileContents.replace("$url", JSON.stringify(relativePath))

      if(!existsSync(_outputPath)){
        await ensureFile(_outputPath);
      }
      copyFileSync(filePath, outputPath);
      writeFileSync(_outputPath, fileContents);
      return { fileContents };
    }
  }
}