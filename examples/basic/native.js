import NativeModule from 'module'
// import vm from 'vm'

// export function evalModuleCode(
//   context,
//   code,
//   filename
// ) {
//   const module = new NativeModule(filename)
//   module.loaded
//   // @ts-ignore: private method
//   module.paths = NativeModule._nodeModulePaths(context)
//   module.filename = filename
//   // @ts-ignore: private method
//   module._compile(code, filename)

//   return module.exports
// }

// const test = evalModuleCode(
//   "test",
//   'export function () {console.log("abc");}',
//   "./native.js"
// )

// const _vm = new vm.SourceTextModule(
//   `
//   const a = 1234;
//   print(a);
//   `
// );

const test = new Function('import React from "./server.js"');

console.log(test(1,2));
