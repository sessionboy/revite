import { ReactNode, ComponentType } from "react";

export type ReactComponent = React.FC|React.ComponentClass;
export type DynamicComponent = (props?: any)=>Promise<any>;

export interface Route {
  path: string
  key?: string
  component: DynamicComponent
  getInitialProps?: Function
  children?: Route[]
  Loading?: ComponentType
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
