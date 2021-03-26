import Servable from "servable"
import startServer from "../server/index.js"
import { InternalConfig } from "@revite/types"
import { Logger } from "@revite/utils"

export class Revite extends Servable {
  private _ready:any;
  private _initCalled:any = false;
  public config: InternalConfig;
  public serve:any;
  public render:any;
  public log: Logger;
 
  constructor(config: InternalConfig){
    super();
    this.config = config;
    this.log = new Logger();

    //Init server
    // this._initServer()
  }

  // _initServer () {
  //   if (this.serve) {
  //     return
  //   }
  //   console.log("startServer", startServer);
  //   this.serve = startServer(this);
  //   this.render = this.serve.app;
  // }

  ready () {
    if (!this._ready) {
      this._ready = this._init()
    }
    return this._ready
  }

  async _init () {
    if (this._initCalled) {
      return this
    }
    this._initCalled = true

    // Await for server to be ready
    // if (this.serve) {
    //   await this.serve.ready()
    // }

    // Call ready hook
    // await this.callHook('ready', this)
    console.log("[revite]: ready!")
    return this
  }
}