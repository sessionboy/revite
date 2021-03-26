
### 基本思路

```js
app.use(async (req, res, next)=>{

  const url = req.url;
  const pathname = path.parse(url).pathname;

  // 依赖包
  if (url.includes("@packages/")) {
     return code;
  }

  // react-refresh
  if (url === "/@react-refresh") {
     return code;
  }

  // hmr-client
  if (url === '/hmr.js') {
    return HMR_CLIENT_CODE;
  }

  // overlay-client
  if (url === '/overlay.js') {
    return HMR_OVERLAY_CODE;
  }

  // env-client
  if (url === '/env.js') {
    return ""
  }

  if(url.includes(".proxy.js")){
    url = url.replace(".proxy.js",'');
  }

  // 通过loadurl处理 ====================================

  if(js || css || html || media){
    const code = loadUrl(url);
    return code;
  }
  
  next();

})

```