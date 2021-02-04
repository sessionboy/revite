import React from "react";
import { renderToNodeStream, renderToString } from "react-dom/server";
import { ReviteServer, Routes } from "@revite/components";
import { StaticRouter } from "react-router-dom/server";

export default ((ctx, context)=>{
  return renderToString(
    <React.StrictMode>
      <ReviteServer 
        location={ctx.url}     
        context = { context }
      >
        <StaticRouter location={ctx.url}>
          <Routes />
        </StaticRouter>
      </ReviteServer>
    </React.StrictMode>
  )
  // res.write("<!DOCTYPE html>");
  // let stream = renderToNodeStream(
  //   <React.StrictMode>
  //     <ReviteServer 
  //       location={req.url}     
  //       context = { context }
  //     >
  //       <StaticRouter location={context.location}>
  //         <Routes />
  //       </StaticRouter>
  //     </ReviteServer>
  //   </React.StrictMode>
  // );
  // stream.pipe(res);
})
