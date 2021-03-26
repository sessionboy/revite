import { createRequire } from "module"
import { readFileSync } from "fs"
const require = createRequire(import.meta.url);

export const getHmrCode = (filePath: string, code: string) =>{
  return `import * as  __REVITE_HMR__ from '/hmr.js';
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

const reactRefreshLoc = require.resolve('react-refresh/cjs/react-refresh-runtime.development.js');
const reactRefreshCode = readFileSync(
    reactRefreshLoc, 
    {encoding: 'utf-8'}
  ).replace(`process.env.NODE_ENV`, JSON.stringify('development'));

export const getHtmlReactRefreshCode = () =>{
  return `$&
<script>
  function debounce(e,t){let u;return()=>{clearTimeout(u),u=setTimeout(e,t)}}
  {
    const exports = {};
    ${reactRefreshCode}
    exports.performReactRefresh = debounce(exports.performReactRefresh, 30);
    window.$RefreshRuntime$ = exports;
    window.$RefreshRuntime$.injectIntoGlobalHook(window);
    window.$RefreshReg$ = () => {};
    window.$RefreshSig$ = () => (type) => type;
  }
</script>
<script type="module" src="/overlay.js"></script>
`
}


export const getStyleHmrCode = (code: string) =>{
  return `const code = ${JSON.stringify(code)};

if (typeof document !== 'undefined') {
  // inject-hot-code
  
  const styleEl = document.createElement("style");
  const codeEl = document.createTextNode(code);
  styleEl.type = 'text/css';
  styleEl.appendChild(codeEl);
  document.head.appendChild(styleEl);
}else{
  // extract style for ssr
  if(typeof _ssr_style_ !== 'undefined' && Array.isArray(_ssr_style_)){
    if(!_ssr_style_.includes(code)) _ssr_style_.push(code);
  }
}
  `
}