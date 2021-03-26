import { join, dirname } from "path"
import { URL } from "url"
import { createRequire } from "module"
import fsExtra from "fs-extra"
import { InternalConfig } from "@revite/types"
const { copySync, ensureDir, ensureFile, existsSync, readFileSync, writeFileSync } = fsExtra;
const require = createRequire(import.meta.url);

const pkg = require("../package.json");
const _dirname = dirname(new URL(import.meta.url).pathname);

export default async (config: InternalConfig)=>{

  // 检查工作，
  // 比如react>= 17.0，react-router >= 6.0， type=module
  // await fs.writeFile(config.packageJson, '{"type": "module"}')

  // 输出service文件
  let canUpdate: boolean = false;
  const versionPath = join(config.build.serviceDir,"/version.txt");
  if(!existsSync(config.build.serviceDir)){
    await ensureDir(config.build.serviceDir);
    canUpdate = true;
  }else{
    const version = existsSync(versionPath) && readFileSync(versionPath);
    if(version !== pkg.version){
      canUpdate = true;
    }
  }
  if(canUpdate){
    copySync(
      join(_dirname,"../client/overlay.js"), 
      join(config.build.serviceDir,"/overlay.js")
    );

    const hmrFile = readFileSync(join(_dirname,"../client/hmr.js"),"utf-8");
    const options = JSON.stringify({
      port: config.hmr.port,
      host: config.hmr.host
    });
    writeFileSync(
      join(config.build.serviceDir,"/hmr.js"),
      `window.defines = ${options};`+hmrFile
    );

    await ensureFile(versionPath);
    writeFileSync(versionPath,pkg.version);
  }
  
}