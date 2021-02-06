import React,{ useState } from "react";
import ReactDom from "react-dom";
import { BrowserRouter,Router, Routes,Route } from "react-router-dom";
// import { ensureReady, ReviteWeb } from "@revite/components";
import routes from "./router"

const App = () =>{
  const [a,b] = useState(0);
  console.log(routes);
  return (
    <div>
      <BrowserRouter>
        <Routes>
          {routes.map((route)=>{
            return (
              <Route 
                key={route.key}
                path={route.path}
                element={ <route.component /> }
              />
            )
          })}
        </Routes>
      </BrowserRouter>
    </div>
  )
}
 
// ensureReady(routes,async (routes) => {
  ReactDom.render(
    <App />
    // <React.StrictMode>
    //   <ReviteWeb routes={routes}>
    //     <BrowserRouter>
    //       <Routes />
    //     </BrowserRouter>
    //   </ReviteWeb>
    // </React.StrictMode>
    ,document.getElementById('root')
  )
// })

if (import.meta.hot) {
  import.meta.hot.accept();
}