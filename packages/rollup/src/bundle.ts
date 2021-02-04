import path from "path"
import fs from 'fs-extra'
import WebSocket from "ws";
import chokidar,{ FSWatcher } from "chokidar"
import esbuild from "esbuild"
import { HMRPayload } from "./hmrPayload.js"
import hmrPlugin from "./plugins/hmr.js"

const { startService } = esbuild;
const paths:any = {};

export type HMRWatcher = FSWatcher & {
  handleVueReload: (
    filePath: string,
    timestamp?: number,
    content?: string
  ) => void
  handleJSReload: (filePath: string, timestamp?: number) => void
  send: (payload: HMRPayload) => void
}

export type bundleType = "change"|"init";

export const bundle = async (type:bundleType = "change") =>{
  const start = process.hrtime();
  console.log("start bundle...")
  if(type == "init" && fs.existsSync(paths.appBuild)){
    await fs.remove(paths.appBuild);
  }
  const service = await startService();
  await Promise.all([
    await service.build({
      platform: 'node',
      format: 'esm',
      bundle: true,
      splitting: true,
      loader: {
        '.js': 'jsx',
        '.png': 'file',
        '.svg': 'file',
        '.jpg': 'file'
      },
      minify: false,
      entryPoints: [
        path.join(paths.appSrc, '/routes.js'),
        path.join(paths.appSrc, '/layout/entry-server.tsx')
      ],
      outdir: path.join(paths.appBuild, 'server'),
      outExtension: { '.js': '.mjs' },
      sourcemap: false,
      metafile: path.join(paths.appBuild, 'server-metafile.json'),
      define: {
        'process.env.NODE_ENV': JSON.stringify('development'),
        'process.browser': "false",
      }
    }),
    await service.build({
      platform: 'browser',
      format: 'esm',
      splitting: true,
      bundle: true,
      loader: {
        '.js': 'jsx',
        '.png': 'file',
        '.svg': 'file',
        '.jpg': 'file'
      },
      minify: false,
      entryPoints: [
        // path.join(paths.appSrc, '/routes.js')
        path.join(paths.appSrc, '/layout/entry-client.tsx')
      ],
      outdir: path.join(paths.appBuild, 'client'),
      sourcemap: true,
      metafile: path.join(paths.appBuild, 'client-metafile.json'),
      define: {
        'process.env.NODE_ENV': JSON.stringify('development'),
        'process.browser': "true",
      },
      plugins:[
        hmrPlugin()
      ]
    })   
  ])
  await fs.copy(paths.appPublic, paths.appBuild);
  const end = process.hrtime(start)
  const timeInMs = (end[0] * 1000000000 + end[1]) / 1000000
  console.log(`Bundle - success in ${Math.floor(timeInMs)}ms`)
}

export const watchStart = async (server: any): Promise<HMRWatcher> =>{
  const ws = new WebSocket.Server({ server });
  const reload = () => {
    if (ws?.clients) {
      for (const client of ws.clients) {
        client.send('reload')
      }
    }
    console.log("reload...")
  }
  const watcher = chokidar.watch(paths.appPath, {
    ignored: [  
      '**/node_modules/**',
      '**/build/**', 
      '**/.git/**'
    ],
    ignoreInitial: true,
  })
    .on('add', async (file) => {
      console.log("add",file)
      await bundle()
      reload()
    })
    .on('change', async (file) => {
      console.log("change",file)
      await bundle()
      reload()
    })
    .on('unlink', async (file) => {
      console.log("unlink",file)
      await bundle()
      reload()
    }) as HMRWatcher

  return watcher;
}