import { readFileSync } from "fs"
import { extname } from "path"
import esbuild,{ Message } from "esbuild"
import { Plugin } from "../types.js"
import { scriptReg } from "./config.js"
import { prettifyMessage } from "../utils.js"
import { DESTRUCTION } from "dns"
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
export default ({ config }:any): Plugin => {
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
  
      try {
        const result = await service.transform(contents, {
          loader: getLoader(filePath)
        });
        cacheCode.set(contents, result);
        return result;
      } catch (e) {   
        if (e.errors) {
          e.frame = ''
          e.errors.forEach((m: Message) => {
            e.frame += `\n` + prettifyMessage(m, contents)
          })
          e.loc = e.errors[0].location
        }
        throw e;
      } finally {
        service.stop();
      }
    }
  }
}