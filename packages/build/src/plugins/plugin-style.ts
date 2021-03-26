import { readFileSync } from "fs"
import fsExtra from "fs-extra"
import esbuild, { Message } from "esbuild"
import { Plugin } from "../types.js"
import { styleReg } from "./config.js"
import { getStyleHmrCode } from "./util.js"
import { prettifyMessage } from "../utils.js"
const { startService } = esbuild;

export default ({ config }: any): Plugin => {
  return {
    name: "@revite/plugin-style",
    filter: styleReg,
    load: async (filePath: string)=> {
      const service = await startService();
      const contents = readFileSync(filePath,"utf8");

      try {
        const result = await service.transform(contents, {
          loader: "css"
        });
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
    },
    transform: async (code)=> {
      const cssHmrCode = getStyleHmrCode(code); 
      return { code: cssHmrCode };
    }
  }
}