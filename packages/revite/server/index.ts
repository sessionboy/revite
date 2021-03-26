import { createRequire } from "module";
const require = createRequire(import.meta.url);

export default async (revite:any)=>{
  let serverPath = revite.dev ? "./dev-server.js" : "./server.js";
  let Server:any = await import(serverPath).then(res=>res.default);

  console.log("Server", Server);
  return new Server(revite);
}

