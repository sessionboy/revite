import { PassThrough } from "stream";
import path from 'path'
import { createRequire } from 'module'
import { parse } from 'url';
import { ServerPluginContext } from "../types.js"
import { loadInitialData } from "../services/loadInitialData.js"
import loadAssets from "../services/loadAssets.js"
const require = createRequire(import.meta.url);
const { matchRoutes } = require("react-router-dom");

const ignorePaths = [
  "/favicon.ico"
]

export default (context: ServerPluginContext)=>{
  context.app.use(async (ctx,next)=>{
    const config = context.options;
    const url = parse(ctx.url);
    const pathname = url.pathname||"";     
    const htmlStream = new PassThrough();
    // 获取路由
    const routesPath = path.join(config.buildOptions.outputDir, "/server/routes.mjs");
    const { default: routes } = await import(routesPath);

    // 加载组件数据    
    const matchs:any = matchRoutes(routes, ctx.url);
    let initialData = await loadInitialData(matchs, pathname);

    // 获取渲染内容
    const entryServerPath = path.join(
      config.buildOptions.outputDir, 
      "/server/layout/entry-server.mjs"
    );
    const { default: renderer } = await import(entryServerPath);

    // 获取css、js
    const assetsPath = path.join(config.buildOptions.outputDir, "/client-metafile.json");
    const { outputs } = await require(assetsPath);
    const { scripts, styles } = loadAssets(outputs);
    const reactStream = await renderer(ctx,{ 
      data: initialData||{},
      routes,
      scripts:["client/layout/entry-client.js"],
      styles
    });
    
    // 渲染
    htmlStream.write('<!DOCTYPE html>');
    reactStream.pipe(htmlStream);
    ctx.type = 'text/html';
    ctx.body = htmlStream;
  })
}