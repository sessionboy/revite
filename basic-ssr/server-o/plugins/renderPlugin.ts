import { extname } from 'path'
import { parse } from 'url';
import { InternalConfig } from '@revite/types';
import { ServerPluginContext } from "../types.js"
import { runtimeCode, runtimePublicPath } from "../hmr.js"
import ssrRender from "../ssr/ssrRender.js"
import spaRender from "../ssr/spaRender.js"

export interface RenderProps {
  ctx: any
  context: ServerPluginContext
  config: InternalConfig
  url: string
  pathname: string,
  isProd: boolean
}

export default (context: ServerPluginContext)=>{
  const config = context.options;
  const isProd = process.env.NODE_ENV === "production";

  context.app.use(async (ctx,next)=>{
    const url = parse(ctx.url);
    const pathname = url.pathname||"";     

    // /@react-refresh
    if(pathname == runtimePublicPath && !isProd){
      ctx.type = 'js';
      ctx.body = runtimeCode;
      return;
    }

    if(pathname == "/" || !extname(pathname)){    
      const renderProps: RenderProps = {
        ctx,
        context,
        config,
        url: ctx.url,
        pathname,
        isProd
      }  
      if(config.ssr){
        await ssrRender(renderProps);
      }else{
        await spaRender(renderProps);
      }      
    } else {
      next()
    }

  })
}