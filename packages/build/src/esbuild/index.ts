import { join, basename, relative } from "path"
import fsExtra from "fs-extra"
import esbuild from "esbuild"
import { ReviteConfig } from "@revite/types"
import cjs_to_esm_plugin from "./cjs-to-esm-plugin.js"
import resolve_path_plugin from "./resolve-path-plugin.js"
const { startService } = esbuild;
const { writeFileSync,existsSync,ensureFileSync } = fsExtra;

export const runLibOptimize = async (
  config: ReviteConfig, 
  entryPoints:string[]
) =>{
  const start = process.hrtime();
  console.log("start bundle...")

  const metafile = join(config.buildOptions.webModulesDir,"build-meta.json")
  const service = await startService();
  const buildResult = await service.build({
    absWorkingDir: config.root,
    target: 'esnext',
    format: 'esm',
    bundle: true,
    write:false,
    // splitting:true,
    // incremental: true,
    loader: {
      ".js": "js",
      ".mjs": "js",
      ".cjs": "js",
      ".json": "json"
    },
    outbase: '.revite',
    entryPoints,
    outdir: config.buildOptions.webModulesDir,
    define: { 
      'process.env.NODE_ENV': JSON.stringify('development')
    },
    plugins:[
      // resolve_path_plugin(config),
      cjs_to_esm_plugin(config),      
    ]
  })

  let importMap:{
    imports:{ [name:string]: string }
  } = {
    imports:{}
  }
  const importMapPath = join(config.buildOptions.webModulesDir, 'import-map.json')
  const { outputFiles=[], warnings } = buildResult;
  // console.log(buildResult);
  for (let i = 0; i < outputFiles.length; i++) {
    const module = outputFiles[i];
    const name = basename(module.path).replace(".js",'');
    console.log(name,module.path);
    if(entryPoints.includes(name)){
      const _modulesPath = relative(config.buildOptions.webModulesDir,module.path);
      importMap.imports[name] = _modulesPath[0]==="."?_modulesPath:`./${_modulesPath}`;
    }
    if(name === "components"){
      const _modulesPath = relative(config.buildOptions.webModulesDir,module.path);
      importMap.imports["@revite/components"] = _modulesPath[0]==="."?_modulesPath:`./${_modulesPath}`;
    }
    if(!existsSync(module.path)){
      ensureFileSync(module.path);
    }
    writeFileSync(module.path,module.contents);
  }
  writeFileSync(
    importMapPath,
    JSON.stringify(importMap, null, 2),
  );

  const end = process.hrtime(start)
  const timeInMs = (end[0] * 1000000000 + end[1]) / 1000000
  console.log(`Bundle - success in ${Math.floor(timeInMs)}ms`);
}