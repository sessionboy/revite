import Koa from "koa";
import serve from "koa-static";
import { join, dirname } from "path"

const root = new URL(dirname(import.meta.url)).pathname;
const staticDir = join(root,"/.revite");
const app = new Koa();

app.use(serve(staticDir));

app.listen(3004,()=>{
  console.log("http://localhost:3004");
})