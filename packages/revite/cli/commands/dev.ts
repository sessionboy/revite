import glob from "glob"
import { join } from "path"
import { existsSync } from "fs"
// import { Revite } from "@revite/core"
import { Revite } from "../../core/index.js"
// import Server from "../../server/index.js"
import { getReviteConfig } from "@revite/config"
import WebSocket from "../ws.js"
import createWatcher from "../watch.js" 
import { InternalConfig, BuildResult } from "@revite/types"
import { runOptimize } from "@revite/build"
import Server from "../../server/dev-server.js"

export default async () =>{
  const config: InternalConfig = await getReviteConfig({});
  const revite = new Revite(config);
  const server = new Server(revite);

  await server.ready();

  await runOptimize([
    'react', 
    'react-dom',
    'react-dom/server',
    "history",
    "react-router-dom",
    "react-router-dom/server",
    "@revite/components",
    "styled-components",
    "@material-ui/core",
    "@material-ui/core/styles"
  ],config);

  await server.listen();

  return {
    config,
    server,
    render: server.app
  };
}
