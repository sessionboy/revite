import { join, extname } from 'path'
import { styleReg, scriptReg } from "@revite/config"
import { readFileSync } from 'fs';
import { ServerPluginContext } from "../types.js"
import { send } from "../send.js"

export default (context: ServerPluginContext)=>{
  const config = context.config;
  context.app.use(async (req, res, next)=>{   
    const url = req.url||"/";
    const ext = extname(url);
    if(!scriptReg.test(ext) && !styleReg.test(ext)){
      const _path = join(config.build.outputDir, url);
      const html = readFileSync(_path);
      send(req, res, html, "html");
    }else {
      next();
    }
  })
}