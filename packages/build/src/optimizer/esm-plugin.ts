import { PluginBuild, Plugin } from "esbuild"
import lexer from 'es-module-lexer'
import { relative } from "path"
import { InternalConfig } from "@revite/types"
import { normalizePath } from "@revite/utils"
import { MapProps } from "./resolve.js"
import fsExtra from 'fs-extra';
const { parse } = lexer;
const { readFileSync } = fsExtra;

export const flattenId = (id: string) => id.replace(/[\/]/g, '_')

export default (
  config: InternalConfig, 
  metaMap: MapProps, 
  entryPointMaps: MapProps 
): Plugin =>{
  return {
    name: 'transform-esm',
    setup(build: PluginBuild) { 
      build.onResolve({ filter: /.*/ }, args => {          
        if (args.kind === 'entry-point') {
          const input =entryPointMaps[args.path];
          const id = flattenId(input);
          const path = id.endsWith(".js") ? id : id+".js";   

          // 保存meta信息，例如 { "react": "react_index.js" }
          metaMap[input] = path;
          return { 
            path, 
            namespace: 'transform',
            pluginData: { path: args.path }
          }
        }
      })

      build.onLoad({ filter: /.*/, namespace: 'transform' }, async (args) => {
        const { path } = args.pluginData||{};
        let relativePath = normalizePath(relative(config.root, path));         
        if (!relativePath.startsWith('.')) {
          relativePath = `./${relativePath}`
        }

        const [imports, exports] = parse(readFileSync(path, 'utf-8'));
        let cjs = !imports.length && !exports.length ? true : false;
             
        let contents = "";
        if (cjs) {
          // export * from "${_path}"语法对于commonjs无效
          // 因此需要手动填充export导出
          const keys = Object.keys(require(entryPointMaps[path])).join(', ');        
          contents = `
            export { ${keys} } from "${relativePath}";
            export default require("${relativePath}");`
        } else {
          contents = `
            export * from "${relativePath}";
            import * as d from "${relativePath}";
            export default d;`
        }

        return { 
          contents,            
          resolveDir: config.root
        }      
      })
    }
  }
}