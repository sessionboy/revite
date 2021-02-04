export * from './pathUtils.js'
export * from './common.js'
export * from './cache.js'
export { default as Logger } from './logger.js'

// 串行执行，直至最后一个
// function serial(tasks,fn){
//   return tasks.reduce(
//     (promise: Promise<any>, task:any)=>{
//       return promise.then(() => fn(task));
//     }, 
//     // 初始值设为一个promise
//     Promise.resolve(null)
//   )
// }