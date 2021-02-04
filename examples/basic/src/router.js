
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
    path: '*',
    component: ()=> import("./pages/404")
  },
];
