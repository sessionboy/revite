import { createRequire } from "module"
import { resolve } from "path"
import { InternalConfig } from "@revite/types"

const require = createRequire(import.meta.url);
const modulesMap = new Map();

export default async (config: InternalConfig)=>{
  try {
    let cacheModules = modulesMap.get("modules");
    if(cacheModules) return cacheModules;

    const packagesDir = config.build.packagesDir;
    let imports = modulesMap.get("imports");
    if(!imports){
      const meta = require(config.build.metaPath);
      imports = meta;
      modulesMap.set("imports",imports);
    }
    
    const React = await import(
      resolve(packagesDir, imports.react)
    );

    const { renderToString, renderToNodeStream } = await import(
      resolve(packagesDir, imports["react-dom/server"])
    );

    const { Routes, Route, useRoutes } = await import(
      resolve(packagesDir, imports["react-router-dom"])
    );

    const { StaticRouter } = await import(
      resolve(packagesDir, imports["react-router-dom/server"])
    );

    const modules = {
      React,
      renderToString,
      renderToNodeStream,
      StaticRouter,
      useRoutes,
      Routes, 
      Route
    }

    modulesMap.set("modules", modules);
    return modules;

  } catch (error) {
    throw error;
  }
}