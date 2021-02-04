import getCommand, { CommandType } from "./commands/index.js"
import setup from "./setup.js"
import { createRequire } from "module"
const require = createRequire(import.meta.url);

const start = Date.now()
const argv = require('minimist')(process.argv.slice(2))
// make sure to set debug flag before requiring anything
if (argv.debug) {
  process.env.DEBUG = `revite:` + (argv.debug === true ? '*' : argv.debug)
  try {
    // this is only present during local development
    require('source-map-support').install()
  } catch (e) {}
}

import { cac } from 'cac'
const cli = cac(`vite`)

// global options
cli
  .option('--config <file>, -c <file>', `[string]  use specified config file`)
  .option('--debug [feat]', `[string | boolean]  show debug logs`)
  .option(
    '--mode <mode>, -m <mode>',
    `[string]  specify env mode (default: 'development' for dev, 'production' for build)`
  )
  .option(
    '--jsx <preset>',
    `['vue' | 'preact' | 'react']  choose jsx preset (default: 'react')`
  )
  .option('--jsx-factory <string>', `[string]  (default: React.createElement)`)
  .option('--jsx-fragment <string>', `[string]  (default: React.Fragment)`)

// serve
cli
  .command('[root]') // default command，匹配revite root
  // .alias('serve')
  .option('--port <port>', `[number]  port to listen to`)
  .option(
    '--force',
    `[boolean]  force the optimizer to ignore the cache and re-bundle`
  )
  .option('--https', `[boolean]  start the server with TLS and HTTP/2 enabled`)
  .option('--open', `[boolean]  open browser on server start`)
  .action(async (root: CommandType, argv: any) => {
    if (root) {
      argv.root = root
    }
    const cmd = await getCommand(root);
    setup({ dev: "development" });
    await cmd();
    // return cmd();
  })

cli
  // 这里的root相当于 revite build [root]
  .command('build [root]','project')
  .action(async (root: string, argv: any) => {
    if (root) {
      argv.root = root
    }
   const cmd = await getCommand("build");
   setup({ dev: "production" });
   return cmd();
  })

cli
  // 这里的root相当于 revite start [root] 
  .command('start [root]','project')
  .action(async (root: string, argv: any) => {
    if (root) {
      argv.root = root
    }
   const cmd = await getCommand("start");
   setup({ dev: "production" });
   return await cmd();
  })

cli.help()
cli.version(require('../package.json').version)
cli.parse()
