import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { context, ReviteContext } from "./context.js"

export const ReviteContextProvider: React.FC<{ value: ReviteContext }> = ({
  value,
  children,
}) => {
  return <context.Provider value={value}>{children}</context.Provider>
}

export const ReviteBrowser: React.FC = ({ children, context }:any) => {
  return (
    <ReviteContextProvider value={context}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </ReviteContextProvider>
  )
}
