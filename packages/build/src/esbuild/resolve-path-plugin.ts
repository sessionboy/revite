import { createRequire } from 'module'
import { URL } from 'url'
import { PluginBuild } from 'esbuild'
import { InternalConfig } from "@revite/types"
import { join } from 'path'
const require = createRequire(import.meta.url);
global.require = require;

export default (config: InternalConfig)=>{
  return {
    name: 'resolve-path',
    setup({ onResolve, onLoad }:PluginBuild) {
      onResolve({ filter: /.*/ }, args => {
        console.log(args);
        return { path: join(args.resolveDir, args.path) };
      })
    }
  }
} 