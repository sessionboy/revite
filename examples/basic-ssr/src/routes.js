
export const Loading = () =>{
  return "loading....23333"
}

export default [
  {
    path: '/',
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
