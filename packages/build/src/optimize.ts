import { join } from 'path';
import chalk from 'chalk'
import { InternalConfig } from "@revite/types"
import ora from "ora"
import { install } from 'esinstall';
import { createRequire } from 'module';
import { ImportMap } from "./types.js"

const require = createRequire(import.meta.url);

const ignoreModules = [
  "revite"
]

export const runInitOptimize = async (config:InternalConfig,log?:any)=>{
  const start = process.hrtime();
  const spinner = ora('start optimizeing...').start();  
  // Dependency cache out of date. Updating...
  log.info(
    chalk.yellow(
      '! installing dependencies...' 
    )
  );
  // const pkg = require(paths.appPackageJson);
  // const dependencies = pkg.dependencies||{};
  // const optimizeLists = Object.keys(dependencies).filter(i=>!ignoreModules.includes(i))

  let initModules: string[] = [
    'react', 
    'react-dom',
    "history",
    "react-router-dom",
    "@revite/components"
  ]
  if(config.ssr){
    initModules = [
      'react', 
      'react-dom',
      'react-dom/server',
      "history",
      "react-router-dom",
      "react-router-dom/server",
      "@revite/components",
      "styled-components",
      "@material-ui/core",
      "@material-ui/core/styles"
    ]
  }
  const result = await install(
    initModules,
    {
      cwd: config.root,
      dest: config.build.packagesDir,
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
export const runOptimizes = async (modules:Array<string>, config:any) =>{
  const spinner = ora('start optimizing...').start();  
  console.log(modules);
  const result = await install(
    modules,
    {
      cwd: config.root,
      dest: config.build.packagesDir
      // lockfile: newLockfile || undefined,
    }
  );

  spinner.stop();
  return result;
}