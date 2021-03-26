import { Revite } from "../core/index.js"
import { getReviteConfig } from "@revite/config"
import { InternalConfig } from "@revite/types"
import createServer from "./http.js"
import connect from "connect"
import consola from 'consola'
import compression from "compression"
import serve from "serve-static"
import { Server as HttpServer } from "http"
import corsMiddleware from 'cors'
import { ServerContext } from "./types.js"
import htmlMiddleware from "./middlewares/html.js"
import errorMiddleware from "./middlewares/error.js"

export default async ()=>{
  const config: InternalConfig = await getReviteConfig({});
  const revite = new Revite(config);
  const cli = Boolean(process.env.CLI);

  const app = connect() as connect.Server;
  let server: HttpServer|null = null;
  if(cli){
    server = createServer(config, app);
  }

  // 中间件上下文
  const context: ServerContext = {
    revite,
    config,
    app,
    server,
    routes:[]
  }
  
  // 设置cors
  if(config.server.cors){
    app.use(corsMiddleware(config.server.cors));
  }
  // html中间件
  htmlMiddleware(context);

  if(!config.dev){
    app.use((compression as any)());
  } 

  // 注册错误中间件
  errorMiddleware(context);

  // 设置静态目录
  app.use(serve(config.build.outputDir)); 
 
  if(server){
    const port = config.server.port||3000;
    const host = "localhost";
    server.listen(port,()=>{
      consola.success("server is ready!");
      consola.success(`Now you can access: http://${host}:${port}`);
    })
  }

}