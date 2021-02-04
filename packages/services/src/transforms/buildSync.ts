import { buildSync } from "esbuild"

export interface EsbuildSyncOptions {
  entryPoints: Array<string>
  outfile: string
}

export const esbuildSync = ({
  entryPoints,
  outfile = 'bundle.js'
}: EsbuildSyncOptions) =>{
  const result = buildSync({
    entryPoints: ['app.jsx'],
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    outfile: 'out.js',
  })
  console.log(result);
}