import React from "react";
import ReactDom from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { ensureReady, ReviteWeb, Routes } from "@revite/components";
import routes from "./routes"
 
ensureReady(routes,async (routes) => {
  console.log(routes);
  ReactDom.render(
    <React.StrictMode>
      <ReviteWeb routes={routes}>
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </ReviteWeb>
    </React.StrictMode>
    ,document.getElementById('root')
  )
})

if (import.meta.hot) {
  import.meta.hot.accept();
}