import { renderToString } from "react-dom"
import { ServerStyleSheets } from '@material-ui/core/styles';

export default (revite)=>{
  revite.hook("render",({ App, context })=>{
    const sheets = new ServerStyleSheets();
    const html = renderToString(
      sheets.collect(<App />)
    );
    context.styles.push(sheets.getStyleElement());
    return { html, context };
  })
}