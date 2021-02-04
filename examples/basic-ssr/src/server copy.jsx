import React from "react";
import { renderToNodeStream, renderToString } from "react-dom/server.js";
// import { ReviteServer,  } from "@revite/components";
import { useRoutes, Routes, Route } from "react-router-dom"
import { StaticRouter } from "react-router-dom/server.js";

function Document(props) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>React App</title>
      </head>
      <body>
        <div id="root">
          {props.children}
        </div>
        <script type="module" src="/client/index.js"></script>
      </body>
    </html>
  )
}

const mapRoutes = (props) =>{
  const { route, routesData, ...rest } = props;
  let routeProps = {
    ...rest,
    route,
    initialData: routesData[route.key]
  }
  if(route.children){
    return (
      <Route 
        key={route.key}
        path={route.path} 
        element={<route.component {...routeProps} />} 
      >
        {route.children.map((route)=>
          mapRoutes(Object.assign(rest,{
            route, 
            routesData,
          }))
        )}
      </Route>
    )
  }else{
    return (
      <Route 
        key={route.key}
        path={route.path} 
        element={<route.component {...routeProps} />} 
      />
    )
  }
}

export default (ctx, context)=>{
  const route = context.routes[0];
  let stream = renderToNodeStream(
    <React.StrictMode>
      {/* <ReviteServer 
        location={ctx.url}     
        context = { context }
      > */}
        <Document>
          <StaticRouter location={ctx.url}>
            wuhahahaha
            <Route 
              key={route.key}
              path={route.path} 
              element={route.element} 
            />
            {/* <Root /> */}
            {/* <Routes 
              routes={context.routes} 
              routesData={context.data}
            /> */}
            {/* <Routes>
              {context.routes.map((route) =>
                mapRoutes(Object.assign({},{
                  route, 
                  routesData: {}
                }))
              )}
            </Routes> */}
          </StaticRouter>
        </Document>
      {/* </ReviteServer> */}
    </React.StrictMode>
  )
  console.log("stream",stream);
  // stream.pipe(ctx.response);
  ctx.type = 'text/html';
  ctx.body = stream;
}