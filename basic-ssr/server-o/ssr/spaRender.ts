import { readFileSync, createReadStream } from 'fs';
import { injectHtmlReactRefreshCode } from "../hmr.js"
import { RenderProps } from "../plugins/renderPlugin.js"

export default async ({ ctx, config, isProd }: RenderProps)=>{
  ctx.type = 'text/html';
  if(isProd){
    const htmlStream = createReadStream(config.htmlPath,"utf-8");
    ctx.body = htmlStream;
  }else{
    let html = readFileSync(config.htmlPath,"utf-8");
    const reactRefreshCode = injectHtmlReactRefreshCode();

    html = html.replace(/<body.*?>/,reactRefreshCode);
    ctx.body = html;
  }
  
}