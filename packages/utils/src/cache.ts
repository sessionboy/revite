import LRU,{ Options } from "lru-cache"

export {
  LRU,
  Options
}
export const createCache = (options?: Options<any, any>) =>{
  return new LRU(options);
}