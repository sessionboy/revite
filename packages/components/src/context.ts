import React from 'react'

export interface ReviteContext {
  version?: string | null
  routes: any[]
  matchedRoutes?: any[]
  children?: any
  routesData?:object
  store?:object
}

export const context = React.createContext<ReviteContext | null>(null)
export const useRevite = () => React.useContext(context);