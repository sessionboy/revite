import { join, extname, relative } from "path"
import fsExtra from "fs-extra"
import { Revite } from "@revite/core"
import { getType, replaceExt } from "@revite/utils"
import { 
  InternalConfig,
  Plugin, 
  FileContext,
  BuildResult,
  TransformResult,
  PluginOptions,
  HMRError
} from "@revite/types"
import { getOutputExt } from "./utils.js"
import readyPlugins from "./readyPlugins.js"
import { runOptimize } from "./optimizer/index.js"
const { writeFileSync, copySync, ensureFile, existsSync } = fsExtra;

const pluginCaches = new Map<string, Plugin[]>();

interface BuildOptions {
  outputDir: string
}

export default class Bundler {
  private revite: Revite;
  private config: InternalConfig;
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
        revite.callHook(
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

  async build(filePaths: string[], options?:BuildOptions): Promise<BuildResult[]> {
    const unOptimizes: string[] = [];
    const buildPromise = filePaths.map(async (filePath: string) => {
      const fileExt = extname(filePath);      
      const buildOptions = this.config.build;

      // 1，根据filter查找符合条件的插件
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
        if(plugins.length > 0){
          pluginCaches.set(filePath, plugins);
        }
      }      
      if(plugins.length === 0){
        return Promise.resolve(null);
      }     
     
      // 2，获取load(加载)插件，
      const loadPlugins:any = plugins.filter(plugin=>plugin.load);
      if(loadPlugins.length === 0){
        return Promise.resolve(null);
      }
      // 如果有多个load插件，则取最后一个
      const loadPlugin = loadPlugins[loadPlugins.length - 1];
      const outputExt = loadPlugin.outputExt||getOutputExt(fileExt, buildOptions.outputExt);
      if(!outputExt){
        return Promise.resolve(null);
      }
      const write = loadPlugin.write;
      const _outputDir = options?.outputDir||this.config.build.clientDir;   
      const relativePath = relative(
        this.config.root, 
        replaceExt(filePath,outputExt)
      ).replace("src/",'');

      let outputPath = join(_outputDir, relativePath);          

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
      const accessPath = fileContext.outputPath.replace(this.config.build.outputDir,'');
      
      // 5，输出文件
      if(write){
        if(!existsSync(outputPath)){
          await ensureFile(outputPath);
        }
        writeFileSync(outputPath, fileContext.fileContents);
      }

      return {
        ...fileContext,
        accessPath
      };
    })

    // 构建未优化的依赖
    if(unOptimizes.length>0){
      await runOptimize(unOptimizes, this.config);
    }

    // 等待所有构建完成
    const buildResult:any = await Promise.all(buildPromise);
    
    // 此处添加一个构建完成的钩子

    copySync(
      this.config.publicPath, 
      this.config.build.outputDir,
      {
        filter: (src)=>!src.endsWith(".html")
      }
    );
    
    return buildResult;
  }
}
