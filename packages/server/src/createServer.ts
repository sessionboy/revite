import { createRequire } from "module"
const require = createRequire(import.meta.url);

export const createServer = (revite: any) =>{
  const Server = require("./start.js");
  return new Server(revite);
}