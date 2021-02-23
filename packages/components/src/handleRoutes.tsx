import { Route } from "@revite/types"
import { matchPath } from "react-router-dom";
import React from "react"
import { dynamic } from "./ssrDynamic.js"

const getRouteKey = (path:string, parentPath?:string) =>{
  if(parentPath){
    return path.startsWith("/") ? `${parentPath}${path}` : `${parentPath}/${path}`
  }
  return path;
}

export const handleRoutes = async (args:any) =>{
  const { routes, routesData, pathname, Loading } = args;
  const mapRoutes = (
    routes: Route[], 
    pathname: string, 
    parentPath?: string
  ) =>{
    return routes.map(async (route: Route)=>{
      let key = getRouteKey(route.path,parentPath);
      const Component:any = dynamic(route.component,route.Loading||Loading);
      const initialData = routesData[key];

      const isMatch = route.path !== "*" && matchPath(route.path,pathname);
      if(isMatch && Component.load){
        await Component.load();
      }

      if(route.children && route.children.length>0){
        const children:any[] = await Promise.all(mapRoutes(route.children, pathname, key));        
        return {
          path: route.path,
          key,
          children,
          initialData,
          element: <Component 
            initialData={initialData} 
          />
        }
      }else{
        return {
          path: route.path,
          key,
          data: routesData[key],
          element: <Component 
            initialData={initialData} 
          />
        }
      }   
    })
  }
  return await Promise.all(
    mapRoutes(routes,pathname)
  );
}