import React from "react";
import { WebContext, ServerContext } from "./context.js";
import { ReviteServerContext, ReviteWebContext } from "./types.js"

// 顶层组件：客户端的Revite 
export const ReviteWeb = ({ children, ...rest }: ReviteWebContext)=>{
  return (
    <WebContext.Provider 
      value={ rest } 
    >
      { children }
    </WebContext.Provider>
  )
}

// 顶层组件：服务端的Revite
export const ReviteServer = ({ children, ...rest }: ReviteServerContext) =>{
  return (
    <ServerContext.Provider 
      value={ rest } 
    >
      { children }  
    </ServerContext.Provider>
  )
}
