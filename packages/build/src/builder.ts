import { Revite } from "@revite/core"
import { relative, join } from "path"
import fs, { copySync } from "fs-extra"
import { scriptReg, styleReg, htmlReg } from "@revite/config"
import { InternalConfig } from "@revite/types"
import { getType, cleanUrl } from "@revite/utils"
import { getPlugins } from "./plugins/getPlugins.js"
import { 
  Plugin,
} from "./types.js"
const { writeFile, ensureFileSync } = fs;

const cacheModules = new Map();

export class Builder {
  // revite实例
  private revite: Revite;

  // revite内部配置
  private config: InternalConfig;

  private plugins: Plugin[];

  constructor(revite:any){

    // 基本配置
    this.revite = revite;
    this.config = revite.config;

    // 插件列表
    this.plugins = getPlugins(revite);
  }

  fileType(file: string){
    if(scriptReg.test(file)) return "js";
    if(styleReg.test(file)) return "css";
    if(htmlReg.test(file)) return "html";
    return null;
  }

  async transform(url: string, write:boolean = false) {
    return this.build(url, write);
  }

  async build(url: string, write:boolean = false) {
    let file = cleanUrl(url);

    // 1，准备工作，可更改配置项
    // const options = (await this.service.ready(this.config))||this.config;

    // 2，寻找可用的插件
    let plugins: Plugin[] = this.plugins.filter(({ filter }:any)=>{          
      if(getType(filter) == "RegExp"){
        return filter.test(file);
      }
      if(getType(filter) == "Function"){
        return filter(file);
      }
      return false;
    })

    // 没有可用的插件
    if(plugins.length === 0){
      return null;
    }     

    let id = file;
    let code:string|null = null;
    let map:any;

    // 3，解析文件准确路径
    const resolvePlugins:any = plugins.filter(plugin=>plugin.resolve);
    if(resolvePlugins[0]){
      const result = await resolvePlugins[0].resolve(file, this.config.htmlPath);
      if (result){
        id = result.id||result
      }
    }     

    // 4，加载文件源码
    const loadPlugins: any = plugins.filter(plugin=>plugin.load);
    if(loadPlugins.length === 0){
      // 没有可用的load插件
      return null;
    }
    const loadResult = await loadPlugins[0].load(id);     
  
    if(!loadResult){
      return null;
    }
    if(loadResult.warnings && loadResult.warnings.length>0){
      console.log("loadResult.warnings", loadResult.warnings)
    }
    const cacheCode = cacheModules.get(loadResult.code);
    if(cacheCode){
      // 5，检查code缓存，如果存在则直接返回缓存结果
      return { 
        code: cacheCode, 
        type: "js"
      };
    }
    code = loadResult.code;
    map = loadResult.map;

    // 4，确保该文件被监听
    // this.watcher.add(file);
    // const watchResult = await this.service.watch(file);

    // 5，转换文件
    const transformPlugins: any = plugins.filter(plugin=>plugin.transform);
    for (const plugin of transformPlugins) {
      if (!plugin.transform) continue
      const result = await plugin.transform(code, id);
      if (result){
        code = result.code;
        map = result.map||map;
      }
    }

    if(!code) return null;

    // 7，优化捆绑代码
    // const bundleResult = await this.service.bundle(code);

    // 8，构建完成回调
    // await this.service.done();

    // 缓存最终结果
    cacheModules.set(loadResult.code, code);

    // this.fileType(file)
    return { code, type: "js", map };
  }

}