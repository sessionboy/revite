import { extname } from 'path'
import { parse } from "url"
import { ServerContext } from "../types.js"
import { send } from "../send.js"
import { Builder } from "@revite/build"
import { imageReg } from "@revite/config"

export default ({ config, ws, app, revite }: ServerContext)=>{
  const builder = new Builder(revite);
  
  app.use(async (req, res, next)=>{   
    let url = req.url||"/";
    const pathname = parse(url).pathname||"/";
    const ext = extname(pathname);

    if(ext){

      // 如果不是url?import形式的图片请求，则不需要做处理，
      // 而是通过设置静态目录返回
      if(imageReg.test(ext) && !url.endsWith("?import")){
        return next();
      }

      // 忽略public资源请求
      if(url.startsWith("/public")){
        return next();
      }

      try {
        // console.log("load:pathname", pathname)
        const result:any = await builder.transform(pathname);        
        if(result){
          return send(req, res, result.code, result.type);
        }else{
          return send(req, res, "404", "html");
        }       
      } catch (error) {
        return next(error);
      }
    }
    next()
  })

}

