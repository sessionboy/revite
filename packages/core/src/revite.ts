import Servable,{ servableFn } from "servable"
import { Server } from "@revite/server"
import { ReviteConfig } from "@revite/types"
import { Logger } from "@revite/utils"
import { id, ModuleNode, ModuleStore } from "./store.js"

export class Revite extends Servable {
  public config: ReviteConfig
  private _ready:any;
  private _initCalled:any = false;
  public serve:any;
  public handler:any;
  public meta:any = {}
  public log: Logger;
  public store: ModuleStore = new Map<id,ModuleNode>();

  constructor(config: ReviteConfig){
    super();
    this.config = config;
    this.log = new Logger();

    // Init server
    this._initServer()

    // Call ready
    // if (this.config._ready !== false) {
    //   this.ready().catch((err:any) => {
    //     consola.fatal(err)
    //   })
    // }
  }

  // static get version () {
  //   return `v${version}` + (global.__NUXT_DEV__ ? '-development' : '')
  // }

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

    // Add hooks
    // if (isPlainObject(this.config.hooks)) {
    //   this.addHooks(this.config.hooks)
    // } else if (typeof this.config.hooks === 'function') {
    //   this.config.hooks(this.hook)
    // }

    // Await for server to be ready
    if (this.serve) {
      await this.serve.ready()
    }

    // Call ready hook
    // await this.callHook('ready', this)
    console.log("[revite]: ready!")
    return this
  }

  // async close (callback:Function) {
  //   await this.callHook('close', this)

  //   if (typeof callback === 'function') {
  //     await callback()
  //   }
  // }
}