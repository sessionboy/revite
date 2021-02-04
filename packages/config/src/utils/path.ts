import path from "path";
import fs from "fs";
import { createRequire } from "module"
import getPublicUrlOrPath from "./getPublicUrlOrPath.js";
const require = createRequire(import.meta.url);

export const appDirectory = fs.realpathSync(process.cwd());
export const resolveApp = (relativePath: string) => path.resolve(appDirectory, relativePath);

export const publicUrlOrPath = getPublicUrlOrPath(
  process.env.NODE_ENV === 'development',
  require(resolveApp('package.json')).homepage,
  process.env.PUBLIC_URL
);

export const moduleFileExtensions = [
  'web.mjs',
  'mjs',
  'web.js',
  'js',
  'web.ts',
  'ts',
  'web.tsx',
  'tsx',
  'json',
  'web.jsx',
  'jsx',
];

// Resolve file paths in the same order as webpack
export const resolveModule = (resolveFn: Function, filePath:string) => {
  const extension = moduleFileExtensions.find(extension =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  );

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }

  return resolveFn(`${filePath}.js`);
};

// @remove-on-eject-begin
export const resolveOwn = (relativePath: string) => new URL(`../${relativePath}`,import.meta.url);
// path.resolve(__dirname, '..', relativePath);


export const resolveRoutes = () => {
  let path = resolveApp('src/routes');
  try {
    if (fs.existsSync(path) && fs.statSync(path).isDirectory()) {
      return resolveModule(resolveApp, 'src/routes/index');
    }
    return resolveModule(resolveApp, 'src/routes');
  } catch (e) {
    return false
  }
}
