import { dynamic } from "@revite/components"
import { Route } from "@revite/types"
import { createRequire } from 'module'
const require = createRequire(import.meta.url);
const React = require("react");

// 渲染前加载数据，以及动态组件
export const loadRoutes = async (matchs=[], pathname:string="") => {
  let initialData:any = {};
  let routes: Route[] = [];
  const promises = matchs.map(async (item:any)=>{
    const route = item.route;    
    const { default: component, getInitialProps } = await route.component();
    let _getInitialProps = getInitialProps||route.getInitialProps;
    let dynamicComponent = dynamic(component);
    if(getInitialProps){
      initialData[route.key] = await getInitialProps()
    }
    routes.push({  
      ...route,
      getInitialProps: _getInitialProps,
      component: dynamicComponent,
      element: React.createElement(component)
    })
  })
  
  await Promise.all(promises);

  return { initialData, routes };
}