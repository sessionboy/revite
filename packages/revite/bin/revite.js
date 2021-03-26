#!/usr/bin/env node
import { createRequire } from "module"
global.require = createRequire(import.meta.url);

/*
  * 表示程序由cli启动，而不是自定义server，
  * 这用于区别cli 和 custom server非常有用
*/ 
process.env.CLI = true;

import '../dist/cli/cli.js';

// import path from "path"
// import { createRequire } from "module"
// const require = createRequire(import.meta.url)
// const routesPath = path.join(process.cwd(), "/build/routes.js");
//   const routes = await require(routesPath);
//   console.log("routes",routes);

// import spawn from "cross-spawn"
// import { createRequire } from "module"
// const require = createRequire(import.meta.url);

// const spawn = require("cross-spawn");
// const args = process.argv.slice(2);

// const scriptIndex = args.findIndex(
//   x => x === 'build' || x === 'dev' || x === 'start' || x === 'test'
// );
// const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
// const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

// if (['build', 'dev', 'start', 'test'].includes(script)) {
//   const result = spawn.sync(
//     process.execPath,
//     nodeArgs
//       .concat(require.resolve('../dist/cli.js'))
//       .concat(args.slice(scriptIndex + 1)),
//     { stdio: 'inherit' }
//   );
//   if (result.signal) {
//     if (result.signal === 'SIGKILL') {
//       console.log(
//         'The build failed because the process exited too early. ' +
//           'This probably means the system ran out of memory or someone called ' +
//           '`kill -9` on the process.'
//       );
//     } else if (result.signal === 'SIGTERM') {
//       console.log(
//         'The build failed because the process exited too early. ' +
//           'Someone might have called `kill` or `killall`, or the system could ' +
//           'be shutting down.'
//       );
//     }
//     process.exit(1);
//   }
//   process.exit(result.status);
// } else {
//   console.log('Unknown script "' + script + '".');
//   console.log('Perhaps you need to update react-scripts?');
//   console.log(
//     'See: https://facebook.github.io/create-react-app/docs/updating-to-new-releases'
//   );
// }
