import React from "react"
import { renderToString } from "react-dom/server"
import { ServerStyleSheets } from '@material-ui/core/styles';

export default (revite)=>{
  revite.hook("render",({ App, context } = {})=>{
    const sheets = new ServerStyleSheets();
    const html = renderToString(
      sheets.collect(<App />)
    );
    context.styles.push(sheets.toString());
    return { html, context };
  })
}