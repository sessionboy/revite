import path,{ extname } from 'path'
import { parse } from 'url';
import { readFileSync } from 'fs';
import { ServerPluginContext } from "../types.js"
import { injectHtmlReactRefreshCode } from "../hmr.js"

export default (context: ServerPluginContext)=>{
  const config = context.options;
  context.app.use(async (ctx,next)=>{
    const url = parse(ctx.url);
    const pathname = url.pathname||"";     
    if(pathname == "/" || !extname(pathname)){            
      const htmlPath = path.join(config.publicPath, "/index.html");
      let html = readFileSync(htmlPath,"utf-8");
      const reactRefreshCode = injectHtmlReactRefreshCode();
      html = html.replace(/<body.*?>/,reactRefreshCode);
      ctx.type = 'text/html';
      ctx.body = html;
    }else{
      next()
    }
  })
}