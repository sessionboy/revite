import { join } from "path"
import { existsSync, unlinkSync } from "fs"
import chokidar,{ FSWatcher } from "chokidar"
import { Revite } from "@revite/core"
import { replaceExt } from "@revite/utils"
import { HmrType } from "@revite/types"

export default (revite: Revite): FSWatcher =>{
  const config = revite.config;
  const log = revite.log;
  const onFileChange = (file: string, fileLoc: string, type: HmrType) =>{
    if(type == "unlink"){
      log.info(`remove file ${fileLoc}`,{ markText: "hmr:remove" });
      revite.callHook("notification:hmr",{ type: "reload" });
    }else{
      revite.callHook("build:general",{ file, type, fileLoc });
    }
  }

  const watcher = chokidar.watch(["."], {
    cwd: config.root,
    ignored: [ ".revite","node_modules" ],
    persistent: true,
    ignoreInitial: true,
    disableGlobbing: false
  });

  // 添加文件
  watcher.on('add', (fileLoc) => {
    const filePath = config.root + `/${fileLoc}`;   
    onFileChange(filePath, fileLoc, "add");
  });

  //删除文件
  watcher.on('unlink', (fileLoc) => {
    const filePath = config.root + `/${fileLoc}`;   
    onFileChange(filePath, fileLoc, "unlink");

    // 删除该文件
    const outputExt = config.build.outputExt;
    const rfile = join(
      config.build.clientDir, 
      replaceExt(fileLoc,outputExt).replace("src/",'')
    );
    if(existsSync(rfile)){
      unlinkSync(rfile);
    }
  });

  // 更改文件
  watcher.on('change', (fileLoc) => {
    const filePath = config.root + `/${fileLoc}`; 
    onFileChange(filePath, fileLoc, "update");   
  });

  return watcher;
}