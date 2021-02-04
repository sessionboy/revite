import { createRequire } from 'module'
import { URL } from 'url'
import { PluginBuild } from 'esbuild'
import { ReviteConfig } from "@revite/types"
import { join } from 'path'
const require = createRequire(import.meta.url);
global.require = require;

export default (config: ReviteConfig)=>{
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