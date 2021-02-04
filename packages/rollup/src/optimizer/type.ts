
export interface DepOptimizationOptions {
   // 需要被处理的依赖
   include?: string[]

   // 不需要被处理的依赖
   exclude?: string[]

   /*
    * 在 link 中指定的依赖不会被 optimize 处理，因为需要防止被缓存。而依赖的依赖会被优化。
    * 在 monorepo 这种架构中使用。(monorepo架构 可参考 lerna)
   */ 
   link?: string[]

   // 使用 node 原生模块，但是不直接在浏览器中使用
   allowNodeBuiltins?: string[]
   
   /**
    * 是否在启动时自动执行 `revite optimize` 
    * @default true
    */
   auto?: boolean
}

export interface FilteredDeps {
   // id: entryFilePath
   qualified: Record<string, string>
   external: string[]
 }