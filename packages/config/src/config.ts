import { existsSync } from 'fs'
import defaultsDeep from 'lodash/defaultsDeep.js'
import isEmpty from "lodash/isEmpty.js"
import { ReviteConfig, SsrOptions } from "@revite/types"
import { getType } from "@revite/utils"
import { default as loadDefaultConfig } from "./default.js"
import { loadConfig } from "./load.js"
import { resolveApp } from "./utils/index.js"

export const scriptReg = /\.(js|mjs|jsx|ts|tsx)$/;
export const cssReg = /\.(css)$/;
export const styleReg = /\.(css|less|sass|scss)$/;
export const htmlReg = /\.(html|htm)$/;
export const imageReg = /\.(png|jpg|jpeg|svg|gif|avif|webp|apng)$/;
export const videoReg = /\.(mp3|ogg)$/;
export const mediaReg = /\.(mp4|flv)$/;

export const scriptExts = [".js",".mjs",".jsx",".ts",".tsx",".json"];
export const styleExts = [".css",".sass",".less",".scss"];
export const htmlExts = [".html",".htm"];
export const assetsExts = [ ".png", ".jpg", ".jpeg", ".svg" ]
export const supportedExts = ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'];
export const mainFields = ['module', 'jsnext', 'jsnext:main', 'browser', 'main'];

export const defaultSsrOption: SsrOptions = {
  mode: "stream", 
  routeType: "config", 
  routes: resolveApp('src/routes.js')
}

export const getReviteConfig = async (options:any):Promise<ReviteConfig> => {
  const root = process.cwd();
  const defaultConfig = loadDefaultConfig();
  let config: any = await loadConfig(root);
  if(config.alias){
    config.alias = Object.assign(config.alias,defaultConfig.alias);
  }
  // console.log(getType(config.ssr));
  // if(getType(config.ssr) === "Object"){
  //   config.ssr = Object.assign(defaultSsrOption, config.ssr);
    
  // }
  return defaultsDeep(defaultConfig,config);
}
