import React,{ useState } from "react";
import { useRoutes, Route, Routes } from "react-router-dom"
import { StaticRouter } from "react-router-dom/server.js";

export function Document(props) {
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

export default ({ routes=[], location })=>{
  const [count,setCount] = useState(0);
  let route = routes[0];
  console.log(route);
  return (
    <Document>
      <StaticRouter location={location}>
        <Routes>
          <Route
            path={route.path}
            element={ <route.component /> }
          />
        </Routes>
        hello world!
      </StaticRouter>
    </Document>
  )
}