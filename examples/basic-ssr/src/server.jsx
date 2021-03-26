import React from "react";
import { renderToString } from "react-dom/server";
import App from "./App"

export function Document(props) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>React App</title>
      </head>
      <body>
        <div id="root">
          {props.children}
        </div>
        <script type="module" src="/client/index.js"></script>
      </body>
    </html>
  )
}

// 全局初始数据
export const getInitialProps = () =>{
  return {
    user:{
      name:"jack",
      age: 23
    }
  }
}

export const render = (req, res, context)=>{
  return renderToString(
    <ReviteServer context={context}>
      <Document>
        <App />  
      </Document>      
    </ReviteServer>    
  )
}
