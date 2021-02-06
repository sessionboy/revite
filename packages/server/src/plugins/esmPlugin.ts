import { join, extname } from 'path'
import { createRequire } from 'module'
import { parse } from 'url'
import { readFileSync } from 'fs';
import { styleReg } from "@revite/config"
import LRU from "lru-cache"
import { ServerPluginContext } from "../types.js"
import { injectHmrCode } from "../hmr.js"

const require = createRequire(import.meta.url);
const { transformSync } = require('@babel/core');

const ignorePaths = [
  "/service/hmr.js",
  "/service/hmr-error-overlay.js"
]

const proxy = ".proxy.js";
const cache = new LRU<string, string>();

export default (context: ServerPluginContext)=>{
  const config = context.options;
  context.app.use(async (ctx,next)=>{
    const pathname = parse(ctx.url).pathname||"";
    if(pathname.endsWith(".js")){
      const _path = join(config.buildOptions.outputDir,pathname);
      let contents = readFileSync(_path, "utf-8"); 
      ctx.type = 'js';
      
      // 如果已缓存，则从缓存读取
      const cacheCode = cache.get(contents);
      if(cacheCode){        
        ctx.body = cacheCode;
        return;
      }

      // 裸模块和service不需要注入hmr代码
      if(ignorePaths.includes(pathname) || pathname.includes("web-modules")){
        cache.set(contents, contents);
        ctx.body = contents;        
        return;
      }

      let code = contents;     
      if(pathname.endsWith(proxy)){
        const proxyFile = pathname.replace(proxy,'');
        const ext = extname(proxyFile);
        if(styleReg.test(ext)){
          // 给style proxy注入hmr代码
          code = injectHmrCode(_path, contents);
        }        
      }else{
        // 需要babel注入react-refresh
        let result = transformSync(contents, {
          ast: false,
          compact: false,
          sourceMaps: false,
          configFile: false,
          babelrc: false,
          plugins: [
            require('react-refresh/babel'), 
            require('@babel/plugin-proposal-class-properties')
          ],
        });
        if (/\$RefreshReg\$\(/.test(result.code)) {
          code = injectHmrCode(_path, result.code);
        } 
      }

      // 缓存新代码
      cache.set(contents, code);
      ctx.body = code;        
    }else{
      next();
    }
  })
}