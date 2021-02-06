import { join } from "path"
import { ReviteConfig } from "@revite/types"

export default async (config: ReviteConfig)=>{
  try {
    const React = await import(
      join(config.buildOptions.webModulesDir,"/react.js")
    );
    const { renderToString, renderToNodeStream } = await import(
      join(config.buildOptions.webModulesDir,"/react-dom/server.js")
    );
    const { Routes, Route, useRoutes } = await import(
      join(config.buildOptions.webModulesDir,"/react-router-dom.js")
    );
    const { StaticRouter } = await import(
      join(config.buildOptions.webModulesDir,"/react-router-dom/server.js")
    );
    return {
      React,
      renderToString,
      renderToNodeStream,
      StaticRouter,
      useRoutes,
      Routes, 
      Route
    }
  } catch (error) {
    console.log("error",error);
    console.log("error::message",error.message);
    throw error;
  }
}