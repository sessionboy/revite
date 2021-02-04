import HomePage from "./pages/HomePage"
import ConcatPage from "./pages/ConcatPage"
import AboutPage from "./pages/AboutPage"
import NotFoundPage from "./pages/404"

export default [
  {
    path: '/',
    key: "/",
    component: HomePage,
    // loadData: ()=>{}
  },
  {
    path: '/concat',
    key: "/concat",
    component: ConcatPage
  },
  {
    path: '/about',
    key: "/about",
    component: AboutPage
  },
  {
    path: '*',
    key: "*",
    component: NotFoundPage
  },
];
