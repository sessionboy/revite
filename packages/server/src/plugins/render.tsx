import { join } from "path"
import { PassThrough } from "stream";
import { injectHtmlReactRefreshCode } from "../hmr.js"
import ssrImports from "../imports.js"

(global as any)._ssr_style_ = [] as string[];

export default async ({ ctx, config, routes, routesData, Document }:any)=>{
  const { React, renderToString, useRoutes, StaticRouter } = await ssrImports(config);
  const Routes = () =>useRoutes(routes);
  
  let html = renderToString(
    <Document>
      <StaticRouter location={ ctx.url }>
        <Routes />        
      </StaticRouter>
    </Document>
  )
  const styles = (global as any)._ssr_style_||[];

  const reactRefreshCode = injectHtmlReactRefreshCode();
  html = html.replace(/<body.*?>/,reactRefreshCode);
  if(styles.length>0){
    for (let i = 0; i < styles.length; i++) {
      html = html.replace(/<\/head>/,`<style type="text/css">${styles[i]}</style></head>`);
    }
  }

  ctx.type = 'text/html';
  ctx.body = html;
}