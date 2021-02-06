import React from 'react';
import { dynamic } from "@revite/components"
import HomePage from "./pages/HomePage"
import ConcatPage from "./pages/ConcatPage"
import AboutPage from "./pages/AboutPage"
import NotFound from "./pages/404"

export default [
  {
    path: '/',
    key:"/",
    component: dynamic(()=> import("./pages/HomePage")),
    element: <HomePage />
  },
  {
    path: '/concat',
    key:"/concat",
    component: dynamic(()=> import("./pages/ConcatPage")),
    element: <ConcatPage /> 
  },
  {
    path: '/about',
    key:"/about",
    component: dynamic(()=> import("./pages/AboutPage")),
    element: <AboutPage /> 
  },
  {
    path: '*',
    key:"*",
    component: dynamic(()=> import("./pages/404")),
    element: <NotFound /> 
  },
];
