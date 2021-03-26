import { Loader } from "esbuild"

export const loaders: { [ext:string]: Loader } = {
  ".js": "js",
  ".mjs": "js",
  ".cjs": "js",
  ".jsx": "jsx",
  ".ts": "ts",
  ".tsx": "tsx",
  ".json": "json",
  ".css": 'css',
  ".scss": 'css',
  ".less": 'css',
  '.png': 'file',
  '.svg': 'file',
  '.jpg': 'file'
}

export const defaultOptions = {
  platform: 'browser',
  target: 'esnext',
  format: 'esm',
  bundle: true,
  minify: false,
  splitting: false,
  loader: loaders,
  sourcemap: false,
}