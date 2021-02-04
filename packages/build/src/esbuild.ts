import esbuild from "esbuild"
import { defaultOptions } from "./config.js"
const { startService } = esbuild;

export default class Esbuild {
  options:any;
  service:any = null;
  constructor(options=defaultOptions){
    this.options = options;
  }

  async ready(){
    this.service = await startService();
    return this;
  }

  async build(options={}){
    const config = Object.assign(this.options,options);
    return this.service.build(config);
  }

  async transformSync(options={}){
    const config = Object.assign(this.options,options);
    return this.service.transformSync(config);
  }

  stop(){
    this.service.stop();
  }
}