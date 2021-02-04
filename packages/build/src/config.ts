
export const loaders = {
  ".js": "js",
  ".mjs": "js",
  ".cjs": "js",
  ".jsx": "jsx",
  ".ts": "ts",
  ".tsx": "tsx",
  ".json": "json",
  ".css": 'file',
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