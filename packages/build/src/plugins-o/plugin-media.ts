import fsExtra from "fs-extra"
import { relative } from "path"
import { Plugin, PluginOptions } from "@revite/types"
// import { Plugin } from "../types.js"
import { imageReg } from "@revite/config"
import mineType from "mime-types"
const { writeFileSync,readFileSync, existsSync, ensureFile, copyFileSync } = fsExtra;

const toBase64 = function(file: string){
  let data:any = readFileSync(file);
  data = Buffer.from(data).toString('base64');
  return 'data:' + mineType.lookup(file) + ';base64,' + data;
}
const cache = new Map();
export default ({ config }: any): Plugin => {
  return {
    name: "@revite/plugin-media",
    filter: imageReg,
    write: false,
    load: async (filePath: string)=> {     
      let code = "export default $url;"
      if(config.ssr){
        let url: string = cache.get(filePath);
        if(!url){
          url = toBase64(filePath);
          cache.set(filePath,url);
        }
        code = `export default "${url}";`
      }
      // 缓存文件内容，以便启动时过滤未更改且已编译的文件
      // config.cache(filePath, code);
      return {
        code,
        warnings:[]
      };
    },
    transform: async ({ fileContents, filePath, outputPath })=> {
      const _outputPath = outputPath+".proxy.js";
      let relativePath = relative(config.build.clientDir, outputPath);      
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