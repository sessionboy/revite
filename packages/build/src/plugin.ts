import { join } from "path"
import { Revite } from "@revite/core"
import { InternalConfig } from "@revite/types"
import { getPlugins } from "./plugines/index.js"
import { 
  Plugin,
} from "./types.js"

export class PluginService {
  private revite: Revite;
  private config: InternalConfig;

  private plugins: Plugin[];

  constructor(revite:any){
    this.revite = revite;
    this.config = revite.config;

    this.plugins = getPlugins(revite);
  }

  async ready(options:any){
    return options;
  }

  async resolve(id:string, importer = join(this.config.root, 'index.html')){
    for (const plugin of this.plugins) {
      if (!plugin.resolve) continue

      const result = await plugin.resolve(id, importer)
      if (result) return result;
    }
    return null
  }

  async load(id: string ){
    for (const plugin of this.plugins) {
      if (!plugin.load) continue
      const result = await plugin.load(id)
      if (result) return result;
    }
    return null
  }

  async transform(code: string, id: string){
    for (const plugin of this.plugins) {
      if (!plugin.transform) continue
      const result = await plugin.transform(code, id)
      if (result) return result;
    }
    return null
  }

  async bundle(code: string){
    // 最终捆绑
    return code
  }

  async watch(file: string){

  }

  async done(){

  }
}