import { join } from "path"
import { URL } from "url"
import { createRequire } from "module"
import fsExtra from "fs-extra"
import { InternalConfig } from "@revite/types"
const { copySync, ensureDir, ensureFile, existsSync, readFileSync, writeFileSync } = fsExtra;
const require = createRequire(import.meta.url);

const pkg = require("../package.json");

export default async (config: InternalConfig)=>{

  // 输出service文件
  let update: boolean = false;
  const versionPath = join(config.build.serviceDir,"/version.txt");
  if(!existsSync(config.build.serviceDir)){
    await ensureDir(config.build.serviceDir);
    update = true;
  }else{
    const version = readFileSync(versionPath);
    if(version !== pkg.version){
      update = true;
    }
  }
  if(update){
    const clientDir = new URL("../client/",import.meta.url).pathname;
    copySync(clientDir, config.build.serviceDir);
    await ensureFile(versionPath);
    writeFileSync(versionPath,pkg.version);
  }
  
}