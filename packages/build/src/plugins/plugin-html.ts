import { join, basename } from "path"
import fsExtra from "fs-extra"
import { Plugin, PluginOptions } from "@revite/types"
import { htmlReg } from "./config.js"
import { getHtmlReactRefreshCode } from "./util.js"
const { readFileSync, writeFileSync } = fsExtra;

export default async ({ config }: PluginOptions): Promise<Plugin> => {
  return {
    name: "@revite/plugin-html",
    filter: htmlReg,
    write: false,
    load: async (filePath: string)=> {
      const code = readFileSync(filePath,"utf8");
      return {
        code,
        warnings:[]
      };
    },
    transform: async ({ fileContents, filePath, fileExt, outputPath })=> {
      const code = getHtmlReactRefreshCode();
      fileContents = fileContents.replace(/<body.*?>/,code);
      
      const _outputPath = join(config.build.outputDir,basename(filePath));
      writeFileSync(_outputPath, fileContents);
      return { fileContents, outputPath: _outputPath };
    }
  }
}