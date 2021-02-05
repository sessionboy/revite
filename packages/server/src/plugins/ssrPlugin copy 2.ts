import { PassThrough } from "stream";
import path,{ resolve, join, extname } from 'path'
import { createRequire } from 'module'
import { ReviteConfig } from '@revite/types'
import { parse } from 'url';
import { readFileSync, existsSync } from 'fs';
import { ServerPluginContext } from "../types.js"
import { loadRoutes } from "../services/loadRoutes.js"
import { mapRoutes } from "../services/mapRoutes.js"
import { injectHtmlReactRefreshCode } from "../hmr.js"
import { Routes, ReviteServer } from "@revite/components"
const require = createRequire(import.meta.url);
const React = require("react");
const { renderToString, renderToNodeStream } = require("react-dom/server");
const { matchRoutes, useRoutes } = require("react-router-dom");
const { StaticRouter } = require("react-router-dom/server");

const ignorePaths = [
  "/favicon.ico"
]

const resolvePath = (root: string, module: string) => resolve(root, module);

// lerna下会找不到
const resolveNodeModulePath = (root: string, module: string) =>{
  const moduleDir = join(root,`/node_modules/${module}`);
  const pkgPath = resolvePath(moduleDir,"package.json");
  const pkg = require(pkgPath);
  return resolvePath(moduleDir, pkg.main);
}

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

      const htmlStream = new PassThrough();
      const result = await import(routesPath);
      const _routes = result.default||result.routes||[];
      // const matchs = matchRoutes(_routes,pathname);
      const routes = await Promise.all(mapRoutes(_routes));
      const { default: Renderer } = await import(renderPath);
      const element = React.createElement(
        Renderer, 
        { routes, location: ctx.url }
      )
      const reactStream = renderToNodeStream(element); 
      // console.log(renderToNodeStream(element));
     
      ctx.type = 'text/html';
      reactStream.pipe(htmlStream);
      ctx.body = htmlStream;
      // ctx.body = "html";
    }else{
      next()
    }
  })
}