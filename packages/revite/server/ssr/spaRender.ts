import { readFileSync } from 'fs';
import { injectHtmlReactRefreshCode } from "../hmr.js"
import { RenderProps } from "../plugins/renderPlugin.js"
import { send } from "../send.js"

export default async ({ req, res, config, isProd }: RenderProps)=>{
 
  if(isProd){
    const html = readFileSync(config.htmlPath,"utf-8");
    send(req, res, html, "html");
  }else{
    let html = readFileSync(config.htmlPath,"utf-8");
    const reactRefreshCode = injectHtmlReactRefreshCode();

    html = html.replace(/<body.*?>/,reactRefreshCode);
    send(req, res, html, "html");
  }
  
}