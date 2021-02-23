import { join, extname } from 'path'
import { styleReg, scriptReg } from "@revite/config"
import { createReadStream } from 'fs';
import { ServerPluginContext } from "../types.js"

export default (context: ServerPluginContext)=>{
  const config = context.options;
  context.app.use(async (ctx,next)=>{   
    const ext = extname(ctx.url);
    if(!scriptReg.test(ext) && !styleReg.test(ext)){
      const _path = join(config.build.outputDir,ctx.url);
      ctx.type = ext;
      ctx.body = createReadStream(_path);
    }else {
      next();
    }
  })
}