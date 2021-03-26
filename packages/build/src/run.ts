import { join, extname, relative } from "path"
import fsExtra from "fs-extra"
import { Revite } from "@revite/core"
import { getType, replaceExt } from "@revite/utils"
import { InternalConfig } from "@revite/types"
import { getOutputExt } from "./utils.js"
import readyPlugins from "./readyPlugins.js"
import { runOptimize } from "./optimizer/index.js"

export const urlBuild = (url: string, config: InternalConfig) =>{
  
}