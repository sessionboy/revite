import Koa from "koa"
import connect from "koa-connect"
import Router from 'koa-router'
import { createRevite } from "revite"

const app = new Koa(); 
const revite = await createRevite();
const router = new Router();
const port = 3003;
const host = "localhost"

router.get('/test', (ctx, next) => {
  console.log(ctx.url);
  ctx.body = "hello koa-test!";
});

router.get('/r', (ctx, next) => {
  console.log(ctx.url);
  ctx.body = "hello koa-r!";
});

app.use(router.routes()).use(router.allowedMethods());

app.use(connect(revite.render));

app.listen(port, () => { 
  console.log(`http://localhost:${port}`) 
});