import { Revite } from "@revite/core"
import { 
  htmlPlugin,
  stylePlugin,
  mediaPlugin,
  esmPlugin,
  hmrPlugin, 
  rewritePlugin 
} from "./plugins/index.js"
import { Plugin, PluginOptions } from "@revite/types"

export default async (
  revite: Revite, 
  pluginOptions: PluginOptions
): Promise<Plugin[]> =>{
  
  const config = revite.config;
  const plugins = [
    htmlPlugin,
    stylePlugin,
    mediaPlugin,
    esmPlugin, 
    rewritePlugin, 
    ...config.build.plugins
  ];    
  
  const _plugins = await Promise.all(
    plugins.map(async (plugin)=>{
      const _plugin = await plugin(pluginOptions);
      return {
        write: true,
        ..._plugin
      }
    })
  )
  // 去除名称相同的插件，如果相同则取最后一个
  const pluginObjects:any = {};
  for (let i = 0; i < _plugins.length; i++) {
    pluginObjects[_plugins[i].name] = _plugins[i];
  }

  return Object.values(pluginObjects);
}