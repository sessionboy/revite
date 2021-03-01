import fs from "fs"
import os from 'os'
import { resolve, posix, parse, join, dirname, extname } from "path"
import { Readable } from 'stream'

export const resolveApp = (...args: string[]) => resolve(...args);

export const getRouteKey = (path:string, parentPath?:string) =>{
  if(parentPath){
    return path.startsWith("/") ? `${parentPath}${path}` : `${parentPath}/${path}`
  }
  return path;
}

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

export const getFile = (
  path: string,
  formats: string[],
  pathOnly = true
): string | undefined =>{
  const isDir = fs.statSync(path).isDirectory();
  if(isDir){
    path = resolveApp(path,"index");
  }
  for (const format of formats) {
    const fullPath = join(path, format);
    if (fs.existsSync(fullPath)) {
      return pathOnly ? fullPath : fs.readFileSync(fullPath, 'utf-8')
    }
  }
}

export const replaceExt = (path:string, ext: string) =>{
  const _ext = extname(path);
  if(_ext === ext) return path;
  const paths = parse(path);
  return `${paths.dir}/${paths.name}${ext}`;
}


export function lookupFile(
  dir: string,
  formats: string[],
  pathOnly = false
): string | undefined {
  for (const format of formats) {
    const fullPath = join(dir, format);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return pathOnly ? fullPath : fs.readFileSync(fullPath, 'utf-8')
    }
  }
  const parentDir = dirname(dir)
  if (parentDir !== dir) {
    return lookupFile(parentDir, formats, pathOnly)
  }
}

export function isObject(value: unknown): value is Record<string, any> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

const isWindows = os.platform() === 'win32'

export function slash(p: string) {
  return p.replace(/\\/g, '/')
}

export function normalizePath(id: string): string {
  return posix.normalize(isWindows ? slash(id) : id)
}
