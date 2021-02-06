import { createRequire } from 'module'
import { URL } from 'url'
import { PluginBuild } from 'esbuild'
import { ReviteConfig } from "@revite/types"
import { dirname,join } from 'path'
const require = createRequire(import.meta.url);
global.require = require;

export default (config: ReviteConfig)=>{
  return {
    name: 'cjs-to-esm',
    setup({ onResolve, onLoad }:PluginBuild) {
      onResolve({ filter: /.*/ }, args => {
        // console.log("onResolve:args",args);
        if (args.importer === '') return { path: args.path, namespace: 'c2e' }
      })
      onLoad({ filter: /.*/, namespace: 'c2e' }, async (args) => {
        const _module = await import(args.path);
        const module = _module.default||_module;
        let keys = Object.keys(module).join(', ');
        // if(_module.__esModule){
        //   console.log(args, keys,_module.default);
        // }
        const path = JSON.stringify(args.path)
        const _filename = new URL(import.meta.url).pathname;
        const resolveDir = dirname(_filename);
        // if(_module.__esModule){ // export const { ${keys} } = m;
        //   return { contents: `import m from ${path};export default m;export { ${keys} } from ${path};`, resolveDir }
        // }else{
          return { 
            contents: `
             import * as m from ${path};
             import { ${keys} } from ${path};
             export { ${keys} };
             export default m;
            `, 
            resolveDir 
          }
        // }        
      })
    }
  }
} 