import Koa from "koa";
// import React from "react"
// import ReactServer from "react-dom/server.js"
import React from "./.revite/web-modules/react.js";
import ReactServer from "./.revite/web-modules/react-dom/server.js";
import App from "./.revite/client/App.js"
import WrapPage from "./.revite/client/test.js"

const app = new Koa();

app.use(async (ctx)=>{
  const app = ReactServer.renderToString(
    React.createElement(WrapPage,null,
      React.createElement(App)
    )
  )
  ctx.type = 'text/html';
  ctx.body = app;
})

app.listen(3003,()=>{
  console.log("http://localhost:3003");
})