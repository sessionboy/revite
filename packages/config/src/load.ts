import path from 'path'
import fs from 'fs'
import { getType } from "@revite/utils"

export const loadReviteConfig = async ({}) => {
  let options = {};
  return options;
}

export const loadConfig = async () => {
  const root = process.cwd();
  let config = {};
  const configPath = path.join(root,"/revite.config.js")
  if(fs.existsSync(configPath)){
    const configMoudle = await import(configPath);
    let _config = configMoudle.default||configMoudle;
    if(getType(_config) == "Function"){
      const _configFn = await _config();
       _config = _configFn.default||_config;
    }
    if(_config){
      config = _config;
    }
  }
  return config;
}