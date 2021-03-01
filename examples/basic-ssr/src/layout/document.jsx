import React from "react";

export const Document = (props)=> {
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

// document初始数据
export const getInitialProps = () =>{
  return {
    init: {}
  };
}
