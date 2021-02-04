import dynamic from "./dynamic.js";
import { Route } from "./types.js"
import { matchRoutes } from './imports.js'

const mapRoutes = (routes: Route[], parentPath?: string) =>{
  return routes.map((route: Route)=>{
    let key = route.path;
    if(parentPath){
      key = key.startsWith("/") ? `${parentPath}${key}` : `${parentPath}/${key}`
    }
    if(route.children && route.children.length>0){
      const children: Route[] = mapRoutes(route.children, key);
      return {
        ...route,
        key,
        children,        
        component: dynamic(route.component),        
      }
    }else{
      return {
        ...route,
        key,
        component: dynamic(route.component) 
      }
    }   
  })
}

export default async(
  routes:any = [],
  callback: Function
)=> {
  routes = mapRoutes(routes);
  const matchs = matchRoutes(routes, window.location.pathname)||[];
  await Promise.all(matchs.map((route:any)=>{
    if(route.component && route.component.load){
      return route.component.load();
    }
    return undefined;
  }))
  callback(routes);
}
