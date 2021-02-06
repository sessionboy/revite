import { join } from 'path';
import { ReviteConfig } from "@revite/types"
import ora from "ora"
import { install } from 'esinstall';
import { createRequire } from 'module';
import { ImportMap } from "./types.js"

const require = createRequire(import.meta.url);

const ignoreModules = [
  "revite"
]

export const runInitOptimize = async (config:ReviteConfig)=>{
  const start = process.hrtime();
  const spinner = ora('start optimizeing...').start();  
  // const pkg = require(paths.appPackageJson);
  // const dependencies = pkg.dependencies||{};
  // const optimizeLists = Object.keys(dependencies).filter(i=>!ignoreModules.includes(i))

  // let initModules = ['react','@revite/components']
  let initModules = ['react', 'react-dom']
  if(config.ssr){
    initModules.push('react-dom/server'); 
    initModules.push("history"); 
    initModules.push("react-router-dom");
    initModules.push("react-router-dom/server");
    // initModules.push("@revite/components");
  }
  const result = await install(
    initModules,
    {
      cwd: config.root,
      dest: config.buildOptions.webModulesDir,
      polyfillNode: true
    }
  );
  // console.log(result);
  
  spinner.stop()
  const end = process.hrtime(start)
  const timeInMs = (end[0] * 1000000000 + end[1]) / 1000000
  console.log(`Bundle - success in ${Math.floor(timeInMs)}ms`);
  return result;
}

let newLockfile: ImportMap | null = null;
export const runOptimize = async (modules:Array<string>, config:any) =>{
  const spinner = ora('start optimizing...').start();  
  console.log(modules);
  const result = await install(
    modules,
    {
      cwd: config.root,
      dest: config.buildOptions.webModulesDir
      // lockfile: newLockfile || undefined,
    }
  );

  spinner.stop();
  return result;
}