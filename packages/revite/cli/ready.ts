import { join, dirname } from "path"
import { URL } from "url"
import { createRequire } from "module"
import fsExtra from "fs-extra"
import { InternalConfig } from "@revite/types"
const { copySync, ensureDir, ensureFile, existsSync, readFileSync, writeFileSync } = fsExtra;
const require = createRequire(import.meta.url);

const pkg = require("../package.json");
const _dirname = dirname(new URL(import.meta.url).pathname);

export default async (config: InternalConfig)=>{

  // 检查工作，
  // 比如react>= 17.0，react-router >= 6.0， type=module
  // await fs.writeFile(config.packageJson, '{"type": "module"}')
  
}