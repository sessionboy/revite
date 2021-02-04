import { ReviteConfig } from "@revite/types"
import { resolveApp } from "./utils/index.js"

export default (): ReviteConfig => {
  const root = process.cwd();
  return {
    port: 3000,
    root,
    appSrc: resolveApp('src'),
    publicPath: resolveApp('public'),
    packageJson: resolveApp('package.json'),
    htmlPath: resolveApp('public/index.html'),
    alias:{
      "@@": root,
      "@": resolveApp('src'),
    },
    installOptions:{},
    serverOptions:{
      protocol: "http",
      hostname: "localhost",
      port: 3000
    },
    devOptions:{
      protocol: "http",
      hostname: "localhost",
      port: 3000
    },
    buildOptions:{
      outputDir: resolveApp('.revite'),
      webModulesDir: resolveApp('.revite/web-modules'),
      importMapJson: resolveApp('.revite/web-modules/import-map.json'),
      clientDir: resolveApp('.revite/client'),
      serverDir: resolveApp('.revite/server'),
      serviceDir: resolveApp('.revite/service'),
      baseUrl: "/",
      plugins: []
    }
  }
}
