import esbuild from "esbuild"
import lexer from 'es-module-lexer'
import { resolveRealPaths, EntryPoints, MapProps } from "./resolve.js"
import { InternalConfig } from "@revite/types"
import fsExtra from 'fs-extra';
import esmPlugin from "./esm-plugin.js"
const { init } = lexer;
const { writeFileSync, existsSync, ensureFileSync } = fsExtra;

/**
 * 构建依赖包，统一转换为esm代码
 *
 * @param {string} [id] The module id. E.g. react, react-dom
 * @param {string} [resolveDir] The directory to resolve from
 * @returns {string} The module real entry path
 */
export const runOptimize = async (_inputs: string[], config: InternalConfig)=>{
  const start = process.hrtime();
  console.log("start bundle...")
  
  await init;
  const { 
    entryPoints, 
    entryPointMaps 
  }: EntryPoints = await resolveRealPaths(_inputs, config);

  const metaMap: MapProps = {};
  const inputs = Object.values(entryPoints);
  const metaPath = config.build.metaPath;
  await esbuild.build({
    target: 'esnext',
    format: 'esm',
    bundle: true,
    write: true,
    splitting:true,
    entryPoints: inputs,
    outdir: config.build.packagesDir,
    metafile: config.build.buildMapPath,
    absWorkingDir: config.root,
    preserveSymlinks: true,
    define: {
      'process.env.NODE_ENV': JSON.stringify('development')
    },
    plugins:[
      esmPlugin(config, metaMap, entryPointMaps)
    ]
  })
  
  if(existsSync(metaPath)){
    ensureFileSync(metaPath);
  }
  writeFileSync(metaPath, JSON.stringify(metaMap, null, 2))

  const end = process.hrtime(start)
  const timeInMs = (end[0] * 1000000000 + end[1]) / 1000000
  console.log(`Bundle - success in ${Math.floor(timeInMs)}ms`);

  return metaMap;
}