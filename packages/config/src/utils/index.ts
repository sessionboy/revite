export { default as getPublicUrlOrPath } from "./getPublicUrlOrPath.js";
export * from "./path.js"

export const getType = (obj:any) => {
  return Object.prototype.toString.call(obj).replace(/^\[object (\S+)\]$/, '$1');
}
