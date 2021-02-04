import React from 'react';
import { dynamic } from "@revite/components"
import HomePage from "./pages/HomePage"
import ConcatPage from "./pages/ConcatPage"
import NotFound from "./pages/404"

export default [
  {
    path: '/',
    component: dynamic(()=> import("./pages/HomePage")),
    element: <HomePage />
  },
  {
    path: '/concat',
    component: dynamic(()=> import("./pages/ConcatPage")),
    element: <ConcatPage /> 
  },
  {
    path: '*',
    component: dynamic(()=> import("./pages/404")),
    element: <NotFound /> 
  },
];
