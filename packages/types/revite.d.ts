import { ServerOptions } from "https"
import { BuildPlugin } from "./build"

export interface ReviteConfig {
  /**
   * 项目的根目录
   * @default process.cwd()
  */
  root?: string
  /**
   * 项目的index.html绝对路径
  */
  htmlPath?: string
  /**
   * ssr相关配置项
  */
  ssr?:{
    mode?: "stream"|"general"
    routeType?: "config"|"file"
  }
  /**
   * alias相关配置项
  */
  alias?: Record<string, string>
  /**
   * 开发或生产服务器相关配置项
  */
  server?: {
    /**
     * 服务器主机名
     * @default localhost
    */
    host?:string
    /**
     * 开发或生产服务的端口号
     * @default 3000
    */
    port?: number
    // https相关配置
    https?: ServerOptions
    // 代理配置项，参考https://github.com/http-party/node-http-proxy
    proxy?: Record<string, any>
    /**
     * 服务器启动时，自动在浏览器中打开应用程序
     * @default true
    */
    open?: boolean
  }
  /**
   * 构建的相关配置项
  */
  build?: {
    /** 
      * 构建输出目录，相对于root
      * @default .revite
    */
    output?: string
  }
}

export interface InternalConfig {
  root: string
  appSrc: string
  publicPath: string
  packageJson: string
  htmlPath: string
  ssr?: {
    mode: "stream"|"general"
    routeType: "config"|"file"
    /** 
      * 构建之后的routes.js绝对路径，以供ssr读取
      * @default .revite
    */
    routes?: string
    clientRoutes?: string
    clientRoutesPath?: string
    serverRoutes?: string
    serverRoutesPath?: string
  }
  alias?: Record<string, string>
  server: {
    host:string
    port: number
    https?: ServerOptions
    proxy?: Record<string, any>
    open: boolean
  },
  build: {
    /** 
      * 构建输出目录
      * @default .revite
    */
    output: string
    /** 
      * 构建输出目录
      * @default root/output
    */
    outputDir: string
    /** 
      * 输出的js脚本的后缀
      * 为".js"时，需将项目的package.json中type字段设为"module"
      * @default ".js" 
    */
    outputExt: ".js"|".mjs"
    /** 
      * node_modules包的构建输出目录名称
      * @default "@packages"
    */
    packages: string
    /** 
      * node_modules包的构建输出目录路径
      * @default outputDir/@packages
    */
    packagesDir: string
    /** 
      * 构建的meta路径，相对于outputDir
      * @default output/packagesDir/import-map.json.
    */
    meta: string
    /** 
      * 构建的meta.json文件绝对路径
      * @default outputDir/packagesDir/import-map.json.
    */
    metaPath: string
    /** 
      * 前端构建输出目录的名称
      * @default client
    */
    client: string
    /** 
      * 前端构建输出目录
      * @default outputDir/client
    */
    clientDir: string
    /** 
      * ssr后端构建输出目录名称，仅适用于生产构建
      * @default server
    */
    server: string
    /** 
      * ssr后端构建输出目录名称，仅适用于生产构建
      * @default outputDir/server
    */
    serverDir: string
    /** 
      * 输出到前端的开发环境下的依赖服务，比如hmr、error等
      * @default outputDir/service
    */
    serviceDir: string
    /** 
      * 构建时所需要的插件
    */
    plugins: BuildPlugin[]
  }
}


