// import { InternalConfig } from '@revite/types'
// import { Revite } from '@revite/core'
// import consola from 'consola'
// import connect from "connect"
// import { AddressInfo } from 'net'
// import serve from "serve-static"
// import devMiddlewares from "./middlewares/dev.js"
// import staticMiddlewares from "./middlewares/static.js"
// import htmlMiddlewares from "./middlewares/html.js"
// import ProdServer from "./start.js"
// import { runOptimize } from "@revite/build"

// export interface DevServerProps extends DevServer {}

// export default class DevServer extends ProdServer {
//   constructor(config: InternalConfig){
//     super(config);
//   }

//   async setMiddleware(){
//     this.middlewares = [
//       htmlMiddlewares,
//       devMiddlewares
//     ]
//   }

//   async listen(){
//     if (!this.cli && this.server) {
//       // overwrite listen to run optimizer before server start
//       const listen = this.server.listen.bind(this.server)
//       this.server.listen = (async (port: number, ...args: any[]) => {
//         try {
//           // await container.buildStart({})
//           await runOptimize([],this.config);
//         } catch (e) {
//           this.server!.emit('error', e)
//           return
//         }
//         return listen(port, ...args)
//       }) as any
  
//       this.server.once('listening', () => {
//         // update actual port since this may be different from initial value
//         this.config.server.port = (this.server!.address() as AddressInfo).port
//       })
//     } else {
//       await runOptimize([],this.config);
//     }
//   }
// }
