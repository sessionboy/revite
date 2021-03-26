import { InternalConfig } from '@revite/types'
import { Revite } from '@revite/core'
import http from 'http'
import consola from 'consola'
import connect from "connect"
import serve from "serve-static"
import { Server as HttpServer, RequestListener } from "http"
import { State, Context, ServerPluginContext, ServerPlugin } from "./types"
import getPlugins from "./plugins/index.js"

// console.log("is cli:", process.env.CLI);

export default class Server {
  private cli: boolean;
  private revite: Revite;
  private config: InternalConfig;
  private app: any;
  private server: HttpServer|undefined;
  private context: ServerPluginContext;
  private plugins: Array<ServerPlugin>;
  private routes: Array<any> = [];
  private renderer: Function = ()=>{};

  constructor (revite: any) {
    this.cli = Boolean(process.env.CLI);
    this.revite = revite;
    this.config = revite.config;
    this.app = connect();
    if(this.cli){
      this.server = this.createServer({}, 
        this.app.callback()
      );
    }
    this.plugins = getPlugins(this.config);
    // 插件的ctx
    this.context = {
      revite,
      root: this.config.root||process.cwd(),
      app: this.app,
      server: this.server,
      routes: this.routes,
      renderer: this.renderer,
      options: this.config,
      port: this.config.server.port
    }
    this._init();
  }

  createServer(options:any={}, app:RequestListener) {
    const { https, proxy,  } = options;
    return http.createServer(app)
    // https
  }

  async _init(){
    // 注册插件
    this.plugins.forEach((plugin: ServerPlugin) => plugin(this.context))
    
    // 设置静态目录
    this.app.use(serve(this.config.root));
    this.app.use(serve(this.config.publicPath));    
  }

  async ready(){
    // build optimizer
    consola.info("[revite]: start build optimizer...");

    consola.success("revite is ready!");
    if(this.cli && this.server){
      const port = this.config.server.port||3000;
      this.server.listen(port,()=>{
        consola.success("[revite]: listen successfull!");
        consola.success(`http://localhost:${port}`);
      })
    }
  }
}