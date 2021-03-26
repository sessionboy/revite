
export const Loading = () =>{
  return "loading....23333"
}

export default [
  {
    path: '/',
    ssr: true, // 细粒度的ssr控制，允许定义哪些页面ssr，哪些页面spa
    component: ()=> import("./pages/HomePage")
  },
  {
    path: '/concat',
    component: ()=> import("./pages/ConcatPage") 
  },
  {
    path: '/about',
    component: ()=> import("./pages/AboutPage"),
    children:[
      {
        path: ':child',
        component: ()=> import("./pages/Child"),
      }
    ] 
  },
  {
    path: '*',
    component: ()=> import("./pages/404")
  },
];
