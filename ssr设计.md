
#### 一，构建
和前端一样的构建方式，只不过esbuild的构建目标为node，输出目录为 /.revite/server

#### 二，ssr 渲染

前端以 index.jsx 作为入口文件，以App.jsx作为应用根组件

后端ssr没有直接入口，而是使用构建好的 /.revite/server/App.js 作为应用根组件

大体如下:
```js
const App = await import(`${REVITE_OUTPUT}/server/App.js`); 
const routes = await import(`${REVITE_OUTPUT}/server/routes.js`); 
const Routes = () => useRoutes(routes);
const Root = (
  <ReviteContext>
    <App>
      <Routes />
    </App>
  </ReviteContext>
)
```

#### 路由

如果routes.js和pages目录同时存在，则优先使用routes.js，而pages目录不会再映射为路由


#### 使用cacache实现持久缓存