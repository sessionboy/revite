import react from "react";
import { ReviteWebContext, ReviteServerContext } from "./types.js"
const { createContext, useContext } = react;

// web上下文
export const WebContext = createContext({
  routes:[]
} as ReviteWebContext);

export const useReviteContext = () => useContext(WebContext);

// server上下文
export const ServerContext = createContext({
  location:"/",
  context:{
    location: "/",
    data: {},
    store: {},
    meta: null,
    routes: []
  }
} as ReviteServerContext);

export const useReviteServerContext = () => useContext(ServerContext);
