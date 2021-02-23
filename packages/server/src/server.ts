import { InternalConfig } from '@revite/types'
import { Revite } from '@revite/core'
import { createRequire } from 'module'
import http from 'http'
import consola from 'consola'
import Koa from "koa"
import serve from "koa-static"
import { Server as HttpServer, RequestListener } from "http"
import { State, Context, ServerPluginContext, ServerPlugin } from "./types"
import getPlugins from "./plugins/index.js"

const require = createRequire(import.meta.url);

export default class Server {
  private revite: Revite;
  private config: InternalConfig;
  private app: any;
  private server: HttpServer;
  private context: ServerPluginContext;
  private plugins: Array<ServerPlugin>;
  private routes: Array<any> = [];
  private renderer: Function = ()=>{};

  constructor (revite: any) {
    this.revite = revite;
    this.config = revite.config;
    this.app = new Koa<State, Context>();
    this.server = this.createServer({}, 
      this.app.callback()
    );
    this.plugins = getPlugins(this.config);
    // 插件的ctx
    this.context = {
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
    // 合并context
    this.app.use((ctx:any, next:any) => {
      Object.assign(ctx, this.context)
      // ctx.read = cachedRead.bind(null, ctx)
      return next()
    })

    // 注册插件
    this.plugins.forEach((plugin: ServerPlugin) => plugin(this.context))
    
    // 设置静态目录
    this.app.use(serve(this.config.root));
    this.app.use(serve(this.config.publicPath));    
  }

  async ready(){
    // build optimizer
    
    consola.info("[revite]: start build optimizer...");

    // const routesPath = resolve(this.revite.config.build.clientDir,"routes.js");
    // const appPath = resolve(this.revite.config.build.clientDir,"App.js");
    // console.log("isexit", existsSync(routesPath));
    // if(existsSync(routesPath)){
    //   const routes = await import(routesPath);
    //   consola.info("routes::", routes);

    //   const app = await import(appPath);
    //   consola.info("app::", app);
    // }
    
    // listen
    const port = this.config.server.port||3000;
    this.server.listen(port,()=>{
      consola.success("[revite]: listen successfull!");
      consola.success(`http://localhost:${port}`);
    })
  }
}