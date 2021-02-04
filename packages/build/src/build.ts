import { join, extname } from "path"
import fsExtra from "fs-extra"
import { getType } from "@revite/utils"
import { 
  Revite,
  ReviteConfig,
  Plugin, 
  FileContext,
  BuildResult,
  TransformResult,
  PluginOptions,
  HMRError
} from "@revite/types"
import { getOutputExt } from "./utils.js"
import readyPlugins from "./readyPlugins.js"
const { writeFileSync, copySync, ensureFile, existsSync } = fsExtra;

const pluginCaches = new Map<string, Plugin[]>();

export default class Builder {
  private revite: Revite;
  private config: ReviteConfig;
  private pluginOptions: PluginOptions;
  private plugins: Plugin[] = [];

  constructor(revite: Revite){
    this.revite = revite;
    this.config = revite.config;
    this.pluginOptions = {
      config: revite.config,
      cache: {},
      log: revite.log,
      dispacthError: (payload: HMRError)=>{
        revite.dispacth(
          "notification:hmr", 
          { ...payload, type: "error"}
        );
      },
    }
  }

  async ready(){
    this.plugins = await readyPlugins(this.revite, this.pluginOptions);
    return this;
  }

  async build(filePaths: string[], type?: "node"|"web"): Promise<BuildResult[]> {
    const buildPromise = filePaths.map(async (filePath: string) => {
      const fileExt = extname(filePath);      

      // 1，根据filter查找符合的插件
      let plugins = pluginCaches.get(filePath)||[];
      if(plugins.length == 0){                
        plugins = this.plugins.filter(({ filter }:any)=>{          
          if(getType(filter) == "RegExp"){
            return filter.test(filePath);
          }
          if(getType(filter) == "Function"){
            return filter(filePath);
          }
          return false;
        })
      }      
      if(plugins.length === 0){
        return Promise.resolve(null);
      }
      pluginCaches.set(filePath, plugins);
     
      // 2，获取load(加载)插件，
      const loadPlugins:any = plugins.filter(plugin=>plugin.load);
      if(loadPlugins.length === 0){
        return Promise.resolve(null);
      }
      // 如果有多个load插件，则取最后一个
      const loadPlugin = loadPlugins[loadPlugins.length - 1];
      const outputExt = loadPlugin.outputExt||getOutputExt(fileExt);
      if(!outputExt){
        return Promise.resolve(null);
      }
      const write = loadPlugin.write;
      const outputDir = this.config.buildOptions.clientDir;
      const { relativePath } = this.relativePath(filePath, outputExt)          
      let outputPath = join(outputDir, relativePath);          

      // 3，加载文件内容，并用esbuild做初始编译      
      const { code, map, warnings }:any = await loadPlugin.load(filePath);     
      let fileContext: FileContext = {
        filePath,
        fileExt,
        outputPath,
        outputExt,
        relativePath,
        fileContents: code,
        map
      }
    
      // 4，编译文件
      const transformPlugins:any = plugins.filter(plugin=>plugin.transform);
      for (let i = 0; i < transformPlugins.length; i++) {
        const plugin = transformPlugins[i];
        if(plugin.transform){
          const result: TransformResult = await plugin.transform(fileContext);
          fileContext = Object.assign(fileContext,result);
        }        
      }
      const accessPath = fileContext.outputPath.replace(this.config.buildOptions.outputDir,'');
      
      // 5，输出文件
      if(write){
        if(!existsSync(outputPath)){
          await ensureFile(outputPath);
        }
        writeFileSync(outputPath, fileContext.fileContents);
      }

      // 缓存构建结果
      if(!this.revite.store.has(filePath)){
        this.revite.store.set(filePath, {
          id: filePath,
          fileExt: fileContext.fileExt,
          outputPath: fileContext.outputPath,
          outputExt: fileContext.outputExt,
          relativePath: fileContext.relativePath
        })
      }
         
      return {
        ...fileContext,
        accessPath
      };
    })

    const buildResult:any = await Promise.all(buildPromise);
    
    // 此处添加一个构建完成的钩子

    copySync(
      this.config.publicPath, 
      this.config.buildOptions.outputDir,
      {
        filter: (src)=>!src.endsWith(".html")
      }
    );
    
    return buildResult;
  }

  relativePath(filePath:string, outputExt:string){
    const ext = extname(filePath);
    const relativePathName = filePath.substring(
      this.config.appSrc.length,
      filePath.lastIndexOf(ext)
    );
    const relativePath = relativePathName+outputExt;
    return {
      ext,
      relativePathName,
      relativePath
    }
  }
}
