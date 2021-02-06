import { resolve, extname } from 'path'
import { parse } from 'url';
import { existsSync } from 'fs';
import { ServerPluginContext } from "../types.js"
import { handleRoutes } from "../services/mapRoutes.js"
import render from "./render.js"

export default (context: ServerPluginContext)=>{
  const config = context.options;
  context.app.use(async (ctx,next)=>{
    const url = parse(ctx.url);
    const pathname = url.pathname||"";     
    if(pathname == "/" || !extname(pathname)){            
      const routesPath = resolve(config.buildOptions.clientDir,"routes.js");
      if(!existsSync(routesPath)){
        ctx.status = 404;
        ctx.body = "Not found the routes file";
        return;
      }      
      const renderPath = resolve(config.buildOptions.clientDir,"server.js");
      if(!existsSync(renderPath)){
        ctx.status = 404;
        ctx.body = "Not found the server render file";
        return;
      }

      const result = await import(routesPath);
      const _routes = result.default||result.routes||[];
      const { routes, routesData } = await handleRoutes(_routes, pathname);
      const { default: Renderer, Document } = await import(renderPath);
      await render({ ctx, config, routes, routesData, Document });
    }else{
      next()
    }
  })
}