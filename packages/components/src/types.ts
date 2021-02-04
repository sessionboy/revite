import { ReactNode } from "react";

export type DynamicComponent = (props: any)=>Promise<ReactNode>;

export interface Route {
  path: string
  key?: string
  component: DynamicComponent
  getInitialProps?: Function
  children?: Route[]
}


export interface ReviteWebContext {
  routes: Array<Route>
  children?: ReactNode
}

export interface ReviteServerContext {
  location: any
  context: ReviteContext
  children?: ReactNode
}

export interface ReviteContext {
  location: any
  data?: any
  store?:any
  meta?: any
  routes: Array<Route>
}
