import { createRequire } from "module"
import esbuild from "esbuild"
import { extname, dirname, join } from "path"
import { existsSync, readFileSync } from "fs"
import { Plugin } from "../types.js"
import { scriptReg } from "./config.js"
import { getHmrCode } from "./util.js"
const { startService } = esbuild; 

const require = createRequire(import.meta.url);
const babel = require('@babel/core');

const getLoader = (filePath: string): 'js' | 'jsx' | 'ts' | 'tsx' => {
  const ext = extname(filePath);
  if (ext === '.mjs') {
    return 'js';
  }
  return ext.substr(1) as 'jsx' | 'ts' | 'tsx';
}

export default (config: any): Plugin => {
  return {
    name: "@revite/plugin-esm",
    filter: scriptReg,
    async resolve(_id, importer) {
      const root = importer ? dirname(importer): config.root;
      let id = _id;
      
      if(id.startsWith(".")||id.startsWith("/")){
        id = join(root, id);
      }

      return id;
    },
    async load(id) {
      if(!scriptReg.test(id)) return null;
      if(!existsSync(id)) return null;

      const code = readFileSync(id, "utf-8");
      return code;
    },

    async transform (code, id) {
      if(scriptReg.test(id)){
        try {
          const service = await startService();
          console.log("code", code);
          const result = await service.transform(code, {
            loader: getLoader(id)
          });
          console.log("result", result);
          return result;
        } catch (e) {  
          throw e;
        }
      }
    }
  }
}