import React,{ useState } from "react";
import ReactDom from "react-dom";
import { ensureReady, Routes, ReviteBrowser } from "@revite/components"

ensureReady(async (context) => {
  ReactDom.render(
    <ReviteBrowser context={context}>
      <Routes />
    </ReviteBrowser>
    ,document.getElementById('root')
  )
})

if (import.meta.hot) {
  import.meta.hot.accept();
}