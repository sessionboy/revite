// import babel from '@babel/core';
// import { Plugin, PluginBuild } from "esbuild"
// import fs from 'fs';
// import path from 'path';

// export default (options:any): Plugin =>{
//   return {
//     name: 'babel',
//     setup(build:PluginBuild, { transform }:any = {}) {
//       const { filter = /.*/, namespace = '', config = {} } = options;

//       const transformContents = ({ args, contents }) => {
//         const babelOptions = babel.loadOptions({
//           ...config,
//           filename: args.path,
//           caller: {
//             name: 'esbuild-plugin-babel',
//             supportsStaticESM: true
//           }
//         });
//         if (!babelOptions) return { contents };

//         if (babelOptions.sourceMaps) {
//           const filename = path.relative(process.cwd(), args.path);

//           babelOptions.sourceFileName = filename;
//         }

//         return new Promise((resolve, reject) => {
//           babel.transform(contents, babelOptions, (error, result) => {
//             error ? reject(error) : resolve({ contents: result.code });
//           });
//         });
//       };

//       if (transform) return transformContents(transform);

//       build.onLoad({ filter, namespace }, async args => {
//         const contents = await fs.promises.readFile(args.path, 'utf8');

//         return transformContents({ args, contents });
//       });
//     }
//   }
// }

