import ssrPlugin from "./ssrPlugin.js";
import { ReviteConfig } from '@revite/types'
import esmPlugin from "./esmPlugin.js";
import renderPlugin from "./renderPlugin.js";
import assetsPlugin from "./assetsPlugin.js";

export default (config:ReviteConfig)=>{
  let plugins = [
    esmPlugin,
    assetsPlugin
  ];
  if(config.ssr){
    plugins = [ssrPlugin, ...plugins];
  }else{
    plugins = [renderPlugin, ...plugins];
  }
  return plugins;
}
