import "../node-fetch-polyfill.js"
import { resolve } from 'path'
import { existsSync } from 'fs';
import { handleRoutes } from "../ssr/handleRoutes.js"
import { RenderProps } from "../plugins/renderPlugin.js"
import { injectHtmlReactRefreshCode } from "../hmr.js"
import ImportModules from "../imports.js"

(global as any)._ssr_style_ = [] as string[];

export default async ({ ctx, config, pathname, isProd }: RenderProps)=>{
  
  let routesPath = config.ssr?.serverRoutesPath;     
  if(!routesPath){
    ctx.status = 404;
    ctx.body = "Not found the routes config file";
    return;
  }      

  const renderPath = resolve(config.build.clientDir,"server.js");
  if(!existsSync(renderPath)){
    ctx.status = 404;
    ctx.body = "Not found the server render file";
    return;
  }

  const result = await import(routesPath);
  const _routes = result.default||result.routes||[];

  const { routes, routesData } = await handleRoutes(_routes, pathname);
  const { Document, getInitialProps } = await import(renderPath);
  const documentData = getInitialProps? await getInitialProps(): {};

  const { React, renderToString, useRoutes, StaticRouter } = await ImportModules(config);
  const Routes = () =>useRoutes(routes);
 
  // 服务端渲染，并自动提取css
  let html = renderToString(
    <Document data = {documentData}>
      <StaticRouter location={ ctx.url }>
        <Routes />        
      </StaticRouter>
    </Document>
  )
  const styles = (global as any)._ssr_style_||[];
  
  if(!isProd){
    // 开发环境下注入hmr代码
    const reactRefreshCode = injectHtmlReactRefreshCode();
    html = html.replace(/<body.*?>/,reactRefreshCode);
  }
  
  // 注入css样式
  if(styles.length>0){
    for (let i = 0; i < styles.length; i++) {
      html = html.replace(/<\/head>/,`<style type="text/css">${styles[i]}</style></head>`);
    }
  }

  // 注入data
  const __REVITE_DATA__ = {
    env: "development",
    store:{},
    routesData,
    routesPath: config.ssr?.clientRoutes,
  }
  html = html.replace(/<\/head>/,`</head><script>
  window.__REVITE_DATA__ = ${JSON.stringify(__REVITE_DATA__)};
</script>`);

  ctx.type = 'text/html';
  ctx.body = html;

}