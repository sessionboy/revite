import { extname } from 'path'
import { parse } from 'url';
import { IncomingMessage, ServerResponse } from 'http'
import { InternalConfig } from '@revite/types';
import { ServerPluginContext } from "../types.js"
import ssrRender from "../ssr/ssrRender.js"
import spaRender from "../ssr/spaRender.js"

export interface RenderProps {
  req: IncomingMessage
  res: ServerResponse
  context: ServerPluginContext
  config: InternalConfig
  url: string
  pathname: string,
  isProd: boolean
}

export default (context: ServerPluginContext)=>{
  const config = context.config;
  const isProd = process.env.NODE_ENV === "production";

  context.app.use(async (req, res, next)=>{
    const url = parse(req.url||"/");
    const pathname = url.pathname||"";     

    if(pathname == "/" || !extname(pathname)){    
      const renderProps: RenderProps = {
        req,
        res,
        context,
        config,
        url: req.url||"/",
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