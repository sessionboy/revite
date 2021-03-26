import fsExtra from "fs-extra"
import { Plugin } from "../types.js"
import { htmlReg } from "./config.js"
import { getHtmlReactRefreshCode } from "./util.js"
const { readFileSync } = fsExtra;

export default ({ config }: any): Plugin => {
  return {
    name: "@revite/plugin-html",
    filter: htmlReg,
    load: async (filePath: string)=> {
      const code = readFileSync(filePath,"utf8");
      return {
        code,
        warnings:[]
      };
    },
    transform: async (code, importer)=> {
      const refreshCode = getHtmlReactRefreshCode();
      let contents = code.replace(/<body.*?>/,refreshCode);
      return { code: contents };
    }
  }
}