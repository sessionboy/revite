import React from "react"
import { useRoutes } from "react-router-dom"
import { useRevite } from "./context.js"

export const Routes: React.FC = () => {
  const { routes=[] } = useRevite()||{};

  const element = useRoutes(routes);

  return <>{element}</>
}
