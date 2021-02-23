import Servable,{ servableFn } from "servable"
import { Server } from "@revite/server"
import { InternalConfig } from "@revite/types"
import { Logger } from "@revite/utils"

export class Revite extends Servable {
  private _ready:any;
  private _initCalled:any = false;
  public config: InternalConfig
  public serve:any;
  public handler:any;
  public meta:any = {}
  public log: Logger;

  constructor(config: InternalConfig){
    super();
    this.config = config;
    this.log = new Logger();

    // Init server
    this._initServer()
  }

  // 等同于subscribe，但仅提供于用户使用
  hook(type: string, fn: servableFn){
    return this.subscribe(type, fn);
  }

  _initServer () {
    if (this.serve) {
      return
    }
    this.serve = new Server(this);
    this.handler = this.serve.app;
  }

  ready () {
    if (!this._ready) {
      this._ready = this._init()
    }
    return this._ready
  }

  setMeta(key: string, value: string){
    this.meta[key] = value;
  }

  async _init () {
    if (this._initCalled) {
      return this
    }
    this._initCalled = true

    // Await for server to be ready
    if (this.serve) {
      await this.serve.ready()
    }

    // Call ready hook
    // await this.callHook('ready', this)
    console.log("[revite]: ready!")
    return this
  }
}