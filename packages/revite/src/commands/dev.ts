import glob from "glob"
import { Revite } from "@revite/core"
import { getReviteConfig } from "@revite/config"
import WebSocket from "../notification.js"
import ready from "../ready.js"
import createWatcher from "../watch.js" 
import { createCache } from "@revite/utils"
import { ReviteConfig, BuildResult } from "@revite/types"
import { runLibOptimize, runInitOptimize, Builder } from "@revite/build"

const cache = createCache();
export default async () =>{
  
  const config: ReviteConfig = await getReviteConfig({});
  const revite = new Revite(config);
  const log = revite.log;

  // 检查工作，
  // 比如react>= 17.0，react-router >= 6.0， type=module
  // await fs.writeFile(config.packageJson, '{"type": "module"}')

  // 准备工作
  await ready(config);

  // await runInitOptimize(config);
  await runLibOptimize(config,[
    "react",
    "react-dom",
    "react-router-dom",
    "history",
    "@revite/components",
    // "@material-ui/core"
  ])
  // return;

  // 业务代码
  const buildFiles = glob.sync(
    `${config.appSrc}/**/*`,
    { 
      nodir:true,
      absolute: false,
      cache: { path: "FILE" }
    },
  );
  buildFiles.push(config.htmlPath);

  const watcher = createWatcher(revite);

  const builder = await new Builder(revite).ready();

  // hmr-ws
  const ws = new WebSocket(revite.serve.server);

  // 应用初始构建
  const buildResult: BuildResult[] = await builder.build(buildFiles);
  // if(config.ssr){
  //   if(config.ssr.routes && !buildFiles.includes(config.ssr.routes)){
  //     buildFiles.push(config.ssr.routes);
  //   }
  //   if(config.ssr.layout && !buildFiles.includes(config.ssr.layout)){
  //     buildFiles.push(config.ssr.layout);
  //   }
  //   const buildResult: BuildResult[] = await builder.build(buildFiles,"node");
  // }

  // 通知客户端
  revite.subscribe("notification:hmr", async (options) =>{
    ws.send(options);
  })

  // 打包裸模块
  revite.subscribe("build:module", async (options)=>{
    await runInitOptimize(config);
    // await runOptimize(options);
  })

  // 打包业务代码
  revite.subscribe("build:general", async ({ file, fileLoc, type }) =>{
    const buildResult: BuildResult[] = await builder.build([file]);
    const { accessPath } = buildResult[0];
    if(type==="add"){
      log.info(`add new file ${fileLoc}`,{ markText: "hmr:add" });
    }else{
      log.info(`${fileLoc} has updated to ${accessPath}`,{ markText: "hmr:update" });
    }    
    if(fileLoc.endsWith("routes.js")){
      ws.send({ type: "reload" });
      return ;
    }
    ws.send({ bubbled: false, type: "update", url: accessPath });
  })

  // build:routes
  // await buildRoutes();

  // const routesPath = path.join(paths.appBuild, "/routes.js");
  // const routes = await require(routesPath);
  // console.log("routes",routes);
  
  // running / ready
  console.log("ready....");
  await revite.ready()

  // run:build

  // run:build:after

  console.log("dev....");
}
