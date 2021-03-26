import React from "react";
import ReactDom from "react-dom";
import { ensureReady, Routes, ReviteBrowser } from "@revite/components"
import App from "./App"

ensureReady(async (context) => {
  ReactDom.render(
    <ReviteBrowser context={context}>
      <App />
    </ReviteBrowser>
    ,document.getElementById('root')
  )
})

if (import.meta.hot) {
  import.meta.hot.accept();
}