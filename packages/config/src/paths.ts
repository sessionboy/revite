'use strict';

import path from "path";
import fs from "fs";
import { URL } from "url";
import { createRequire } from "module"
import getPublicUrlOrPath from "./utils/getPublicUrlOrPath.js";
const require = createRequire(import.meta.url);

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath: string) => path.resolve(appDirectory, relativePath);

const publicUrlOrPath = getPublicUrlOrPath(
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
const resolveModule = (resolveFn: Function, filePath:string) => {
  const extension = moduleFileExtensions.find(extension =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  );

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }

  return resolveFn(`${filePath}.js`);
};

// @remove-on-eject-begin
const resolveOwn = (relativePath: string) => new URL(`../${relativePath}`,import.meta.url);
// path.resolve(__dirname, '..', relativePath);


const resolveRoutes = () => {
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


export default {
  dotenv: resolveApp('.env'),
  appPath: resolveApp('.'),
  appBuild: resolveApp('build'),
  appDist: resolveApp('build/.dist'),
  appModule: resolveApp('build/web-modules'),
  appModuleJson: resolveApp('build/web-modules/import-map.json'),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  // appIndexJs: resolveModule(resolveApp, 'src/index'),
  appIndexJs: resolveModule(resolveApp, 'src/entry-web'),
  appServerEntry: resolveModule(resolveApp, 'src/entry-server'),
  appRoutesJs: resolveModule(resolveApp, 'src/routes'),
  appJs: resolveModule(resolveApp, 'src/layout/app'),
  appDocumentJs: resolveModule(resolveApp, 'src/layout/document'),
  appRoutesPath: resolveRoutes(),
  appPackageJson: resolveApp('package.json'),
  appAssetsManifest: resolveApp('build/assets-manifest.json'),
  appSrc: resolveApp('src'),
  appConfig: resolveApp('revite.config.js'),
  appTsConfig: resolveApp('tsconfig.json'),
  appJsConfig: resolveApp('jsconfig.json'),
  yarnLockFile: resolveApp('yarn.lock'),
  testsSetup: resolveModule(resolveApp, 'src/setupTests'),
  proxySetup: resolveApp('src/setupProxy.js'),
  appNodeModules: resolveApp('node_modules'),
  swSrc: resolveModule(resolveApp, 'src/service-worker'),
  publicUrlOrPath,
  // These properties only exist before ejecting:
  ownPath: resolveOwn('.'),
  ownNodeModules: resolveOwn('node_modules'), // This is empty on npm 3
  appTypeDeclarations: resolveApp('src/react-app-env.d.ts'),
  ownTypeDeclarations: resolveOwn('lib/react-app.d.ts'),
  moduleFileExtensions
};
