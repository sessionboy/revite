import esbuild from "esbuild"
import { InternalConfig } from "@revite/types"
import { URL } from "url"

/**
 * 通过esbuild解析依赖包的真实入口路径
 *
 * @param {string} [id] 依赖包的名称. 比如react, react-dom等
 * @param {string} [resolveDir] node_modules所在的根目录
 * @returns {string} 依赖包的真实入口路径
 */
const __filename = new URL(import.meta.url).pathname;
export const resolveRealPath = async (id:string, resolveDir = process.cwd())=> {
  let _resolve:any
  const resolvedPromise = new Promise((resolve) => (_resolve = resolve))
  return Promise.race([
    resolvedPromise,
    esbuild
      .build({
        sourcemap: false,
        write: false,
        bundle: true,
        format: 'esm',
        logLevel: 'silent',
        absWorkingDir: resolveDir,
        stdin: {
          contents: `import ${JSON.stringify(id)}`,
          loader: 'js',
          resolveDir,
          sourcefile: __filename
        },
        plugins: [
          {
            name: 'resolve-real-path',
            setup(build) {
              build.onLoad({ filter: /.*/ }, ({ path }) => {
                id = path
                _resolve(id)
                return { contents: '' }
              })
            }
          }
        ]
      })
      .then(() => id)
  ])
}

export type MapProps = { [name:string]: string };
export interface EntryPoints {
  entryPoints: MapProps
  entryPointMaps: MapProps
}
const cacheInputMaps = new Map();
export const resolveRealPaths = async (
  inputs: string[],
  config: InternalConfig
):Promise<EntryPoints> => {
  const entryPoints: MapProps = {};
  const entryPointMaps: MapProps = {};
  inputs = inputs.filter(i=>{ 
    const module = cacheInputMaps.get(i);
    if(module){
      entryPoints[i] = module;
      entryPointMaps[module] = i;
    }
    return !module;
  });

  await Promise.all(inputs.map(async (m)=>{
    const _path: any = await resolveRealPath(m,config.root);
    entryPoints[m] = _path
    entryPointMaps[_path] = m;
    cacheInputMaps.set(m,_path);
    cacheInputMaps.set(_path, m);
  }));

  return { entryPoints, entryPointMaps }
}