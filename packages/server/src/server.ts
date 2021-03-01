import { InternalConfig } from '@revite/types'
import { Revite } from '@revite/core'
import compression from "compression"
import consola from 'consola'
import connect from "connect"
import serve from "serve-static"
import { Server as HttpServer } from "http"
import { ServerPlugin } from "./types"
import getPlugins from "./plugins/index.js"
import createServer from "./createServer.js"
import ImportModules from "./imports.js"

export default class Server {
  private cli: boolean;
  private revite: Revite;
  private config: InternalConfig;
  public app: connect.Server;
  private server: HttpServer|null =null;
  private plugins: Array<ServerPlugin>=[];

  constructor (revite: any) {
    this.cli = Boolean(process.env.CLI);
    this.revite = revite;
    this.config = revite.config;
    this.app = connect() as connect.Server;
    if(this.cli){
      this.server = createServer(this.config,this.app);
    }
    this.plugins = getPlugins(this.config);
    this.app.use((compression as any)());
  }

  async ready(){
    let routes:any = [];
    let modules:any;
    if(this.config.ssr?.serverRoutesPath){
      const result = await import(this.config.ssr?.serverRoutesPath);
      routes = result.default||result.routes||[];
      modules = await ImportModules(this.config);
    } 
  
    const context = {
      revite: this.revite,
      config: this.config,
      app: this.app,
      server: this.server,
      routes,
      modules
    }
    // 注册插件
    this.plugins.forEach((plugin: ServerPlugin) => plugin(context));

    // 设置静态目录
    this.app.use(serve(this.config.root));
    this.app.use(serve(this.config.publicPath)); 

    if(this.cli && this.server){
      const port = this.config.server.port||3000;
      this.server.listen(port,()=>{
        consola.success("revite is ready!");
        consola.success(`http://localhost:${port}`);
      })
    }
  }
}