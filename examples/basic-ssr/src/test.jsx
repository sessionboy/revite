import React,{ Fragment } from 'react';
import { Route } from "react-router-dom"

const Test = () =>{
  return <Route />
}

export const renderHtml = (html) =>{
  const Main = (props)=> (
    <html 
      dangerouslySetInnerHTML = {{ 
        __html: html.replace('<div id="root"></div>',`<div id="root">${props.children}</div>`) 
      }} 
    >
      {props.children}
    </html> 
  )
  return (
    <Fragment>
      <Main />
    </Fragment>
  )
}