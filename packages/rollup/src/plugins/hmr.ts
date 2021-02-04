import path from "path"
import fs from 'fs-extra'

export default ()=>{
  return {
    name: 'revite:hmr',
    setup({ onLoad }:any) {
      // build.onResolve({ filter: /^env$/ }, (args:any) => {
      //   // console.log("onResolve:args",args);
      // })
      onLoad({ filter: /\.tsx$/ }, (args:any) => {
        console.log("tsx:file",args);
      })
    },
  }
}