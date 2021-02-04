import fs from "fs"
import path from "path"
import { Readable } from 'stream'

// 判断是否是裸模块
export const isBare = (url: string): boolean => {
  let cc = url.charAt(0);
  if (cc === "/") return false;
  if (cc === ".") {
      if (url.length === 1) return false;
      cc = url.charAt(1);
      if (cc === "/") return false;
      if (cc === ".") {
          if (url.length === 2) return false;
          cc = url.charAt(2);
          if (cc === "/") return false;
      }
  }
  if (url.charAt(1) === ":") {
      let s = url.charAt(2);
      if (s === "/" || s === "\\") return false;
  }
  if(url.startsWith("import.meta")){
      return false;
  }
  return true;
}


// 准确获取数据类型
export const getType = (obj:any) => {
  return Object.prototype.toString.call(obj).replace(/^\[object (\S+)\]$/, '$1');
}

export const readBody = async (
  stream: Readable | Buffer | string | null
): Promise<string | null> => {
  if (stream instanceof Readable) {
    return new Promise((resolve, reject) => {
      let res = ''
      stream
        .on('data', (chunk) => (res += chunk))
        .on('error', reject)
        .on('end', () => {
          resolve(res)
        })
    })
  } else {
    return !stream || typeof stream === 'string' ? stream : stream.toString()
  }
}


export function lookupFile(
  dir: string,
  formats: string[],
  pathOnly = false
): string | undefined {
  for (const format of formats) {
    const fullPath = path.join(dir, format)
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return pathOnly ? fullPath : fs.readFileSync(fullPath, 'utf-8')
    }
  }
  const parentDir = path.dirname(dir)
  if (parentDir !== dir) {
    return lookupFile(parentDir, formats, pathOnly)
  }
}