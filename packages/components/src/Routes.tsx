// import React,{ useEffect, useState } from "react";
import React from "react";
import { Routes, Route, useLocation } from './imports.js'
import { useReviteContext, useReviteServerContext } from "./context.js"
const { createContext, useContext } = React;

declare global {
  interface Window {
    __INITIAL_DATA__: any
  }
}

const mapRoutes = (props:any) =>{
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
        {route.children.map((route:any)=>
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

export default (props:any) =>{
  let { routes=[], routesData={}, ...rest } = props;
  const isServer = typeof window === "undefined";
  if(isServer){
    const { context } = useReviteServerContext();
    routes = context.routes;
    routesData = context.data;
  } else {
    const ctx = useReviteContext();
    routes = ctx.routes;
    if((window as any).__INITIAL_DATA__){
      routesData = (window as any).__INITIAL_DATA__||{};
    }
  }
  const { pathname } = useLocation();
  const [initialData, setInitialData] = useState(routesData);
  // useEffect(()=>{    
  //   if(!isServer){
  //     const loadData = async ()=>{
  //       const _initialData = await loadInitialData({ 
  //         routes, 
  //         pathname,
  //         initialData 
  //       });
  //       setInitialData(_initialData);
  //     }      
  //     loadData();
  //   }    
  // },[pathname])

  return (
    <Routes>
      {routes.map((route:any) =>
        mapRoutes(Object.assign(rest,{
          route, 
          routesData: initialData
        }))
      )}
    </Routes>
  )
}