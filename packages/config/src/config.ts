import { resolve, relative } from "path"
import { existsSync } from "fs"
import { getFile, replaceExt } from "@revite/utils"
import { ReviteConfig, InternalConfig } from "@revite/types"
import { loadConfig } from "./load.js"

const resolveApp = (...args: string[]) => resolve(...args);
const isProd = process.env.NODE_ENV === "production";

export const getReviteConfig = async (options:any):Promise<InternalConfig> => {
  let config: ReviteConfig = await loadConfig();
  const root = config.root||process.cwd();
  const build = mergeBuild(config,root);
  const cli = Boolean(process.env.CLI);
  const dev = process.env.NODE_ENV !== "production";

  const port = config.server?.port||3000;
  const host = config.server?.host||"localhost";

  return {
    root,
    appSrc: resolveApp(root,'src'),
    publicPath: resolveApp(root,'public'),
    packageJson: resolveApp(root,'package.json'),
    nodeModulesDir: resolveApp(root,'node_modules'),
    htmlPath: config.htmlPath||resolveApp(root,'index.html'),
    hooksDir: resolveApp(root,'hooks'),
    dev,
    hmr:{
      host: config.hmr?.host||host,
      port: config.hmr?.port||cli? port: 23697
    },
    alias:{
      ...config.alias||{},
      "@@": root,
      "@": resolveApp(root,'src'),
    },
    ssr: mergeSSr(config, build, root),
    server:{
      host,
      port,
      open: true,
      https: config.server?.https,
      proxy: config.server?.proxy,
      cors: {}
    },
    build
  }
}

export const mergeSSr = ({ ssr }: ReviteConfig, build:any, root:string) =>{
  if(ssr){
    let routes:string;
    let clientRoutes:string;
    let clientRoutesPath:string;
    let serverRoutes:string;
    let serverRoutesPath:string;

    // 如果是配置式路由，则检查和获取路由配置文件的路径
    if(ssr.routeType == "config"){
      const appSrc = resolveApp(root,'src');
      const _routesPath = getFile(
        resolveApp(appSrc,'routes'),
        [".js",".jsx",".ts",".tsx",".mjs"]
      );
      if(_routesPath && existsSync(_routesPath)){
        routes = replaceExt(relative(appSrc,_routesPath),build.outputExt);       
      }else{
        throw new Error("Not found the routes config file");
      }
    }else{
      routes = `routes${build.outputExt}`;
    }

    if(isProd){                  
      // 如果是pro构建，则设为 outputDir/server/routes...
      serverRoutesPath = resolveApp(build.serverDir,routes);
    }else{
      // 如果是dev环境，则设为 outputDir/client/routes...
      serverRoutesPath = resolveApp(build.clientDir,routes);
    }
    
    clientRoutesPath = resolveApp(build.clientDir,routes);   
    clientRoutes = clientRoutesPath.replace(build.outputDir,'');
    serverRoutes = serverRoutesPath.replace(build.outputDir,'');

    return {
      mode: ssr.mode||"stream", 
      routeType: ssr.routeType||"config", 
      routes,
      clientRoutes,
      serverRoutes,
      clientRoutesPath,
      serverRoutesPath
    }
  }
}

export const mergeBuild = ({ build={} }: ReviteConfig, root:string):any =>{
  const output = build.output||".revite";
  const outputDir = resolveApp(root,output);
  return {
    output,
    outputDir,
    outputExt: ".js",
    packages: "@packages",
    packagesDir: resolveApp(outputDir, "@packages"),
    buildMap: "build-map.json",
    buildMapPath: resolveApp(outputDir, "@packages/build-map.json"),
    meta: "meta.json",
    metaPath: resolveApp(outputDir, "@packages/meta.json"),
    client: "client",
    clientDir: resolveApp(outputDir, "client"),
    server: "server",
    serverDir: resolveApp(outputDir, "server"),
    serviceDir: resolveApp(outputDir, "service"),
    plugins: []
  }
}