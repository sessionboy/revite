
export const generateRoutes = async (routes:any=[]) =>{
  return Promise.all(
    routes.map(async (route:any)=>{
      let component:any = route.component;
      let getInitialProps:any = route.getInitialProps;
      if(route.component.load){
        // 动态组件
        getInitialProps = component.getInitialProps;
      } else {
        // 普通组件 
        let { default: Component, ...rest } = await route.component();
        component = Component;
        if(!getInitialProps){ 
          getInitialProps = rest.getInitialProps || component.getInitialProps;
        }
      }
      // 子组件
      const children = route.children
          ? await generateRoutes(route.children)
          : []     

      return {
        path: route.path,
        key: route.key,
        component,
        children,
        getInitialProps
      }
    })
  )
}

export default generateRoutes;