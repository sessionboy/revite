import { Route } from "@revite/types"
import { getRouteKey } from "@revite/utils"
import React from "react"
import reactRouter from "react-router-dom"
const { matchPath } = reactRouter;

export const handleRoutes = async (routes: Route[], pathname: string) =>{
  const routesData:any = {};
  
  const mapRoutes = (
    routes: Route[], 
    pathname: string, 
    parentPath?: string
  ) =>{
    
    return routes.map(async (route: Route)=>{
      const isMatch = matchPath(route.path,pathname);
      let data = {};
      let key = getRouteKey(route.path,parentPath);
      const result = await route.component();
      const component:any = result.default||result;
      
      const getInitialProps: Function = result.getInitialProps||route.getInitialProps;
      if(isMatch && getInitialProps){
        data = await getInitialProps();
        routesData[key] = data;
      }
  
      const element = React.createElement(component,{ ...data, path: key })
      if(route.children && route.children.length>0){
        const children: Route[] = await Promise.all(
          mapRoutes(route.children, pathname, key)
        );
        return {
          ...route,
          key,
          data: data||{},
          children,        
          element
        }
      }else{
        return {
          ...route,
          key,
          data: data||{},
          element
        }
      }   
    })
  }
  
  const _routes = await Promise.all(mapRoutes(routes,pathname));

  return { routes: _routes, routesData }
}