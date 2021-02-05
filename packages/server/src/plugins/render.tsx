import React from "react"
const { renderToString, renderToNodeStream } = require("react-dom/server");
const { matchRoutes, useRoutes, Routes, Route } = require("react-router-dom");
const { StaticRouter } = require("react-router-dom/server");
import { injectHtmlReactRefreshCode } from "../hmr.js"

export default ({ ctx, config, routes, Document }:any)=>{

  let html = renderToString(
    <Document>
      <StaticRouter location={ ctx.url }>
        <Routes>
          {routes.map((route:any)=>{
            return (
              <Route 
                key={route.key}
                path={route.path}
                element={ <route.component /> }
              />
            )
          })}
        </Routes>
      </StaticRouter>
    </Document>
  )

  const reactRefreshCode = injectHtmlReactRefreshCode();
  html = html.replace(/<body.*?>/,reactRefreshCode);

  console.log(html);

  ctx.type = 'text/html';
  ctx.body = html;
}