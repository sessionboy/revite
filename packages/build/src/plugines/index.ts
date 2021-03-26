import { Revite } from "@revite/core"
import { InternalConfig } from "@revite/types"
import { Plugin } from "../types.js"
import reactRefreshPlugin from "./react-refresh.js"
import resolvePlugin from "./resolve.js"
import rewritePlugin from "./rewrite.js"
import esmPlugin from "./esm.js"

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
    resolvePlugin(options),
    esmPlugin(options),
    rewritePlugin(options),
    reactRefreshPlugin(options),
  ]
}