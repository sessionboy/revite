import { extname } from 'path'
import { createRequire } from 'module'
import { readFileSync } from "fs"

const require = createRequire(import.meta.url);

const proxy = ".proxy.js";
export const injectHmrCode = (filePath: string, code: string) =>{
  if(filePath.endsWith(proxy)){
    const originalPath = filePath.replace(proxy,'');
    if(extname(originalPath) === ".css"){
       return injectStyleHmrCode(code);
    }
  }
  return injectEsmCode(filePath, code);
}

export const injectEsmCode = (filePath: string, code: string) =>{
  return `import * as  __REVITE_HMR__ from '/service/hmr.js';
import.meta.hot = __REVITE_HMR__.createHotContext(import.meta.url);

/** React Refresh: Setup **/
if (import.meta.hot) {
  if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
    console.warn('@revite/plugin-html: HTML setup script not run. React Fast Refresh only works when Revite serves your HTML routes. You may want to remove this plugin.');
  } else {
    var prevRefreshReg = window.$RefreshReg$;
    var prevRefreshSig = window.$RefreshSig$;
    window.$RefreshReg$ = (type, id) => {
      window.$RefreshRuntime$.register(type, ${JSON.stringify(filePath)} + ' ' + id);
    }
    window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
  }
}

${code}

/** React Refresh: Connect **/
if (import.meta.hot) {
  window.$RefreshReg$ = prevRefreshReg
  window.$RefreshSig$ = prevRefreshSig
  import.meta.hot.accept(() => {
    window.$RefreshRuntime$.performReactRefresh()
  });
}
  `
}

export const injectStyleHmrCode = (code: string) =>{
  return `import * as  __REVITE_HMR__ from '/hmr.js';
import.meta.hot = __REVITE_HMR__.createHotContext(import.meta.url);

` + code.replace("// inject-hot-code",`import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    document.head.removeChild(styleEl);
  });
`);
}


const reactRefreshLoc = require.resolve('react-refresh/cjs/react-refresh-runtime.development.js');
const reactRefreshCode = readFileSync(
    reactRefreshLoc, 
    {encoding: 'utf-8'}
  ).replace(`process.env.NODE_ENV`, JSON.stringify('development'));

export const runtimePublicPath = '/@react-refresh';
export const runtimeCode = `
const exports = {}
${reactRefreshCode}
function debounce(fn, delay) {
  let handle
  return () => {
    clearTimeout(handle)
    handle = setTimeout(fn, delay)
  }
}
exports.performReactRefresh = debounce(exports.performReactRefresh, 30)
export default exports
`

export const injectHtmlReactRefreshCode = () =>{
  return `
<script type="module">
  import RefreshRuntime from "${runtimePublicPath}";
  window.$RefreshRuntime$ = RefreshRuntime;
  window.$RefreshRuntime$.injectIntoGlobalHook(window);
  window.$RefreshReg$ = () => {};
  window.$RefreshSig$ = () => (type) => type;
</script>
<script type="module" src="/overlay.js"></script>
`
}