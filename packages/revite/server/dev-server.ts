import serve from "serve-static"
import devMiddleware from "./middlewares/dev.js"
import loadUrlMiddleware from "./middlewares/loadUrl.js"
import htmlMiddleware from "./middlewares/html.js"
import createWatcher from "./watch.js"
import WebSocket from "./ws.js"
import Server from "./server.js"

export default class DevServer extends Server {

  constructor (revite: any) {  
    super(revite);

    // ws
    this.ws = new WebSocket(this.config, this.server);

    // 创建监听器
    this.watcher = createWatcher(revite, this.ws, revite.log);
  }

  protected setMiddleware(){
    // 开发中间件
    this.middlewares = [
      devMiddleware,
      htmlMiddleware,
      loadUrlMiddleware     
    ]
  }

  protected readyStatic(){
    // 设置静态目录
    this.app.use(serve(this.config.publicPath)); 
    this.app.use(serve(this.config.root)); 
  }

}