
const resolvePath = (path) => new URL(path, import.meta.url).pathname;

export default {
  // ssr:{},
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