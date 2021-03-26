import { InternalConfig } from '@revite/types'
import { extname } from "path"
import { cleanUrl } from "@revite/utils"

const packages = "/@packages/";

export default async (url: string, config:InternalConfig): Promise<any> =>{
  const _url = cleanUrl(url);
  const ext = extname(_url);

  // const result = await transformFile(url, config)
  if(url.startsWith(packages)){ // packages
    
  }

  return null;
}