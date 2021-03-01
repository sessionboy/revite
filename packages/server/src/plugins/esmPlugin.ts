import { join, extname } from 'path'
import { createRequire } from 'module'
import { parse } from 'url'
import { readFileSync } from 'fs';
import { styleReg } from "@revite/config"
import LRU from "lru-cache"
import { ServerPluginContext } from "../types.js"
import { injectHmrCode } from "../hmr.js"
import { send } from "../send.js"

const require = createRequire(import.meta.url);
const { transformSync } = require('@babel/core');

const ignorePaths = [
  "/service/hmr.js",
  "/service/overlay.js"
]

const proxy = ".proxy.js";
const cache = new LRU<string, string>();

export default (context: ServerPluginContext)=>{
  const config = context.config;
  const isProd = process.env.NODE_ENV === "production";

  context.app.use(async (req, res, next)=>{
    const url = req.url||"/";
    const pathname = parse(url).pathname||"";
    if(pathname.endsWith(".js")){
      const _path = join(config.build.outputDir,pathname);
      let contents = readFileSync(_path, "utf-8"); 
      
      // 如果已缓存，则从缓存读取
      const cacheCode = cache.get(contents);
      if(cacheCode){        
        send(req, res, cacheCode, "js");
        return;
      }

      // 裸模块和service不需要注入hmr代码
      if(ignorePaths.includes(pathname) || pathname.includes("/@packages")){
        cache.set(contents, contents);
        send(req, res, contents, "js");  
        return;
      }

      let code = contents;     
      if(pathname.endsWith(proxy)){
        const proxyFile = pathname.replace(proxy,'');
        const ext = extname(proxyFile);
        if(styleReg.test(ext) && !isProd){
          // 给style proxy注入hmr代码
          code = injectHmrCode(_path, contents);
        }        
      }else if(!isProd){
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
      send(req, res, code, "js");  
    }else{
      next();
    }
  })
}