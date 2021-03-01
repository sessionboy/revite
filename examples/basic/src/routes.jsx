import { lazy } from 'react';

export default [
  {
    path: '/',
    component: lazy(()=> import("./pages/HomePage")),
  },
  {
    path: '/concat',
    component: lazy(()=> import("./pages/ConcatPage")),
  },
  {
    path: '/about',
    component: lazy(()=> import("./pages/AboutPage")),
  },
  {
    path: '*',
    component: lazy(()=> import("./pages/404")),
  },
];
