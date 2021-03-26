import { ServerPluginContext } from "../types.js"
import serve from "serve-static"

export default (context: ServerPluginContext)=>{
  const config = context.config;
  serve(config.publicPath);
}