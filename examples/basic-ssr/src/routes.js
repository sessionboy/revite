
export const Loading = () =>{
  return "loading...."
}

export default [
  {
    path: '/',
    key: "/",
    component: ()=> import("./pages/HomePage"),
    // loadData: ()=>{}
  },
  {
    path: '/concat',
    key: "/concat",
    component: ()=> import("./pages/ConcatPage") 
  },
  {
    path: '/about',
    key: "/about",
    component: ()=> import("./pages/AboutPage"),
    children:[
      {
        path: ':child',
        key: "/about/:child",
        component: ()=> import("./pages/Child"),
      }
    ] 
  },
  {
    path: '*',
    key: "*",
    component: ()=> import("./pages/404")
  },
];
