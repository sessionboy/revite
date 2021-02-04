import { matchRoutes } from './imports.js'

// 渲染前加载数据，以及动态组件
export default async ({
  routes = [], 
  pathname ="/",
  initialData = {}
}: any) => {
  const matchs = matchRoutes(routes,pathname)||[];
  const promises = matchs.map(async (item:any)=>{
    const route = item.route;    
    if(initialData[route.key]){
      return undefined;
    }
    const component = route.component;
    let getInitialProps = route.getInitialProps;
    // 是否匹配当前路由，如果是则加载路由数据
    const isMatch = item.pathname == pathname;
    if(component.load){
      // 导入动态组件
      let Component = await component.load();
      // 加载动态组件路由数据
      if(Component.getInitialProps && isMatch){
        getInitialProps = Component.getInitialProps;
      }
    } else {
      // 加载当前路由数据
      if(component.getInitialProps && isMatch){
        getInitialProps = component.getInitialProps;
      }
    }
    if(getInitialProps){
      initialData[route.key] = await getInitialProps()
    }
  })
  
  await Promise.all(promises);

  return initialData;
}