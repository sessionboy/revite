
const resolvePath = (path) => new URL(path, import.meta.url).pathname;

export default {
  ssr:{},
  // hooks:{
  //   "render": ({ App, context })=>{
  //     const sheets = new ServerStyleSheets();
  //     const html = renderToString(sheets.collect(<App />));
  //     context.styles.push(sheets.getStyleElement());
  //     return { html, context };
  //   }
  // },
  // 别名必须以 / 开头、结尾
  alias:{
    '/pages/': resolvePath('src/pages'),
    '/components/': resolvePath('src/components'),
    '/layout/': resolvePath('src/layout')
  },

  buildOptions:{
    plugins:[]
  },

  // devBuildOptions:{
  //   plugins:[]
  // },

  // devServerOptions: {

  // },
  
  serverOptions: {
    
  }
}