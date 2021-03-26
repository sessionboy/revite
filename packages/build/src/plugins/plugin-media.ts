import fsExtra from "fs-extra"
import { relative } from "path"
import { Plugin } from "../types.js"
import { imageReg } from "@revite/config"
import mineType from "mime-types"
const { readFileSync } = fsExtra;

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
    load: async (id: string)=> {     
      let relativePath = relative(config.root, id);
      if(!relativePath.startsWith("/")){
        relativePath = `/${relativePath}`;
      }

      let code = `export default "${relativePath}";`
      if(config.ssr){
        let url: string = cache.get(relativePath);
        if(!url){
          url = toBase64(id);
          cache.set(id, url);
        }
        code = `export default "${url}";`
      }
      return {
        code,
        warnings:[]
      };
    }
  }
}