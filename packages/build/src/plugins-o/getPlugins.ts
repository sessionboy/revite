import { Revite } from "@revite/core"
import { InternalConfig } from "@revite/types"
import { Plugin } from "../types.js"
import esmPlugin from "./plugin-esm.js"
import rewritePlugin from "./plugin-rewrite.js"
import stylePlugin from "./plugin-style.js"
import mediaPlugin from "./plugin-media.js"
import hmrPlugin from "./plugin-hmr.js"
import htmlPlugin from "./plugin-html.js"


export interface PluginOptions {
  config: InternalConfig
  logger: any
}

export const getPlugins = (revite: Revite): Plugin[] =>{

  const options: PluginOptions = { 
    config: revite.config, 
    logger: revite.log 
  }
  return [
    htmlPlugin(options),
    stylePlugin(options),
    mediaPlugin(options),
    esmPlugin(options),
    rewritePlugin(options)
    // resolvePlugin(options),
    // esmPlugin(options),
    // rewritePlugin(options),
    // reactRefreshPlugin(options),
  ]
}