
### 基本思路

#### 一，首先，启动时先根据入口文件(index.html)编译
1，查找依赖包并且编译

2，编译业务代码

#### 二，请求或更新时按需加载资源

1，根据请求url去按需加载和编译代码
```js
app.use((req, res, next)=>{
  const content = transformRequest(url);
  send(content, type);
})
```

#### 三，编译的流程

使用rollup构建，并使用rollup的插件结构，确保开发和生产一致性

1，准备插件
将内置的，和用户自定义的插件合并
```js
const resolvePlugins = () =>{

  return {
    // 内置插件
    aliasPlugin, 
    ...prePlugins, // 用户定义的准备插件
    resolvePlugin, 
    htmlPlugin,
    cssPlugin,
    esmPlugin,
    // 其他插件，用户插件
  }
}
```

以下的操作均以插件完成:

2，构建前的一些准备，可以用钩子来处理
```js
revite.callHook("build:pre", ...);
```

3，通过内置load()方法加载文件内容
```js
const code = load(filePath);
return { code, ... }
```

4，通过内置transform()方法做初始的编译工作(比如esbuild)
```js
const content = transform(code);
return { content, ... }
```

实际的构建结构：
```js
const pluginContainer = {
  buildStart: ()=>{
    // 构建前准备工作
    plugins.forEach(plugin=>plugin?.buildStart(ctx));
  },
  resolveId: ()=>{
    // 解析文件id
    plugins.forEach(plugin=>plugin?.resolveId(ctx));
  },
  load: (id)=>{
    // 加载文件内容
    plugins.forEach(plugin=>plugin?.load(ctx));
  },
  transform: (code)=>{
    // 最终编译
    plugins.forEach(plugin=>plugin?.transform(ctx));
  },
  watchChange: ()=>{
    // 最终编译
    plugins.forEach(plugin=>plugin?.watchChange(ctx));
  },
  close: ()=>{
    // 结束工作
  },
}
```

### 四，插件结构
与rollup插件结构一样(方便生产构建时使用rollup，保证一致性)

```js
const plugin = {
  name:"plugin-name",
  type: "pre"|"normal"|"post", // 前置插件，或其他正常插件，默认为"normal"
  resolveId: ()=>{
    // 解析文件id
    plugins.forEach(plugin=>plugin?.resolveId(ctx));
  },
  load: (id)=>{
    // 加载文件内容
    plugins.forEach(plugin=>plugin?.load(ctx));
  },
  transform: (code)=>{
    // 最终编译
    plugins.forEach(plugin=>plugin?.transform(ctx));
  },
  watchChange: ()=>{
    // 最终编译
    plugins.forEach(plugin=>plugin?.watchChange(ctx));
  },
  close: ()=>{
    // 结束工作
  },
}
```

### 五，生产构建
使用rollup构建，使用上面的插件
```js
const bundle = await rollup({
  input,
  ...options.rollupOptions,
  plugins,
  ...
})
```
