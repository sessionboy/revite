import esbuild from "esbuild"
import { join } from "path"
import lexer from 'es-module-lexer'
import { InternalConfig } from "@revite/types"
import fsExtra from 'fs-extra';
import { loaders } from "../config.js"
const { init } = lexer;
const { writeFileSync, existsSync, ensureFileSync } = fsExtra;

/**
 * 构建依赖包，统一转换为esm代码
 *
 * @param {string} [id] The module id. E.g. react, react-dom
 * @param {string} [resolveDir] The directory to resolve from
 * @returns {string} The module real entry path
 */
export const buildProd = async (config: InternalConfig)=>{
  const start = process.hrtime();
  console.log("start bundle...")
  
  await esbuild.build({
    target: 'es2020',
    format: 'esm',
    bundle: true,
    write: true,
    splitting:true,
    // minify: true,
    // sourcemap: true,
    assetNames: 'assets/[name]-[hash]',
    chunkNames: 'chunks/[name]-[hash]',
    loader: loaders,
    entryPoints: [ join(config.appSrc,"/index.jsx") ],
    outdir: join(config.root, "/@dist"),
    absWorkingDir: config.root,
    preserveSymlinks: true,
    define: {
      'process.env.NODE_ENV': JSON.stringify('production')
    }
  })
  
  const end = process.hrtime(start)
  const timeInMs = (end[0] * 1000000000 + end[1]) / 1000000
  console.log(`Bundle - success in ${Math.floor(timeInMs)}ms`);
}