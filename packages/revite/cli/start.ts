
export const createRevite = async () =>{
  const isProd = process.env.NODE_ENV === "production";
  const serverPath = isProd? "./commands/start.js" : "./commands/dev.js";

  const { default: startServer } = await import(serverPath); 
  return startServer();
}