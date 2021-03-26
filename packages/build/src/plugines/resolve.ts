
import { dirname, join, resolve } from "path"
import { cleanUrl } from "@revite/utils"
import { Plugin } from "../types.js"

export default (config: any): Plugin => {
  return {
    name: "@revite/plugin-resolve",
    filter: /.*/,
    async resolve(_id, importer) {
      const root = importer ? dirname(importer): config.root;
      let id = cleanUrl(_id);
      
      if(id.startsWith(".")||id.startsWith("/")){
        id = join(root, id);
      }

      return id;
    }
  }
}