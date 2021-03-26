import { InternalConfig } from '@revite/types'
import { Revite } from "../core/index.js"
import compression from "compression"
import consola from 'consola'
import connect from "connect"
import serve from "serve-static"
import { Server as HttpServer } from "http"
import corsMiddleware from 'cors'
import { ServerMiddleware,ServerContext } from "./types"
import devMiddleware from "./middlewares/dev.js"
import loadUrlMiddleware from "./middlewares/loadUrl.js"
import htmlMiddleware from "./middlewares/html.js"
import errorMiddleware from "./middlewares/error.js"
import createServer from "./http.js"
import { FSWatcher } from "chokidar"
import createWatcher from "./watch.js"
import WebSocket from "./ws.js"

export default class Server {
  private revite: Revite
  private config: InternalConfig;
  private cli: boolean = Boolean(process.env.CLI);

  // connect中间件以及http服务器实例
  public app: connect.Server;
  public server: HttpServer|null =null;

  // 中间件集合
  private middlewares: Array<ServerMiddleware>=[];

  // ssr路由
  private routes: Array<any>=[];

  // 中间件上下文
  private context: ServerContext|null = null;

  // private watcher: FSWatcher;

  private ws: WebSocket;

  constructor (revite: any) {
    this.revite = revite;
    this.config = revite.config;

    // 创建connect实例
    this.app = connect() as connect.Server;

    // 如果不是自定义的服务器，则创建一个新的服务器
    if(this.cli){
      this.server = createServer(this.config,this.app);
    }

    // ws
    this.ws = new WebSocket(this.config, this.server);

    // 创建监听器
    // this.watcher = createWatcher(revite, this.ws);

  }

  private setMiddleware(){
    // 开发中间件
    if(this.config.dev){
      this.middlewares = [
        devMiddleware,
        htmlMiddleware,
        loadUrlMiddleware     
      ]
      return;
    }

    // 生产中间件
    this.middlewares = [
      htmlMiddleware
    ]
  }

  public async ready(){
    // 加载ssr路由
    this.routes = await this.readyRoutes();
    
    // 创建 middleware context
    this.context = {
      revite: this.revite,
      config: this.config,
      app: this.app,
      server: this.server,
      ws: this.ws,
      routes:[]
    }

    // this.config.server.cors 
    // 设置cors
    this.app.use(corsMiddleware({}));

    // 设置中间件
    this.setMiddleware();

    // 生产环境下开启压缩
    if(!this.config.dev){
      this.app.use((compression as any)());
    } 

    // 注册中间件
    this.middlewares.forEach(
      (middleware: ServerMiddleware) => middleware(this.context!)
    );

    // 注册错误中间件
    errorMiddleware(this.context!);

    this.readyStatic();
  }

  private readyStatic(){
    // 设置静态目录
    this.app.use(serve(this.config.publicPath)); 
    this.app.use(serve(this.config.root)); 
  }

  private async readyRoutes(){
    let routes:any = [];

    // 只有在ssr模式下才有路由
    if(this.config.ssr?.serverRoutesPath){
      const result = await import(this.config.ssr?.serverRoutesPath);
      routes = result.default||result.routes||[];
    } 
    return routes;
  }

  public async listen(){
    if(!this.server) return;
    const port = this.config.server.port||3000;
    const host = "localhost";
    this.server.listen(port,()=>{
      consola.success("server is ready!");
      consola.success(`Now you can access: http://${host}:${port}`);
    })
  }

}