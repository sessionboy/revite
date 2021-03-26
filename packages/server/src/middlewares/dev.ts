import { join, resolve, dirname } from 'path'
import { parse, URL } from "url"
import { readFileSync } from 'fs';
import { ServerPluginContext } from "../types.js"
import { send } from "../send.js"
import { runtimeCode } from "../hmr.js"

const __dirname = dirname(new URL(import.meta.url).pathname);

export const HMR_CLIENT_CODE = readFileSync(
  resolve(__dirname, '../../client/hmr.js'),
  'utf8',
);
export const HMR_OVERLAY_CODE = readFileSync(
  resolve(__dirname, '../../client/overlay.js'),
  'utf8',
);

const packageMaps = new Map();

export default ({ config, app }: ServerPluginContext)=>{
  app.use(async (req, res, next)=>{   
    let url = req.url||"/";
    const pathname = parse(url).pathname||"/";
 
    let code = null;

    // deps packages
    if (pathname.startsWith("/@packages/")) {
      const cacheCode = packageMaps.get(url);
      if(cacheCode){
        code = cacheCode;
      }else{
        code = readFileSync(
          join(config.build.packagesDir, pathname.replace("/@packages",'')),
          "utf-8"
        )
        packageMaps.set(url, code);
      }      
    }

    // react-refresh
    if (pathname === "/@react-refresh") {
      code = runtimeCode;
    }

    // hmr-client
    if (pathname === '/hmr.js') {
      const defines = JSON.stringify({
        port: config.hmr.port,
        host: config.hmr.host
      });
      code = `window.defines = ${defines};`+ HMR_CLIENT_CODE;
    }

    // overlay-client
    if (pathname === '/overlay.js') {
      code = HMR_OVERLAY_CODE;
    }

    if(code){
      send(req, res, code, "js");
    }else{
      next();
    }
  })

}