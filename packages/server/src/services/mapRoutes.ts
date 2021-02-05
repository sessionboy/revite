import { Route } from "@revite/types"
import { dynamic } from "@revite/components"

export const mapRoutes = (routes: Route[], parentPath?: string) =>{
  return routes.map(async (route: Route)=>{
    let key = route.path;
    if(parentPath){
      key = key.startsWith("/") ? `${parentPath}${key}` : `${parentPath}/${key}`
    }
    const component = dynamic(route.component);
    if(route.children && route.children.length>0){
      const children: Route[] = await Promise.all(mapRoutes(route.children, key));
      return {
        ...route,
        key,
        children,        
        component     
      }
    }else{
      return {
        ...route,
        key,
        component
      }
    }   
  })
}