import React, { useState, useEffect } from 'react';
import {createPortal } from 'react-dom';
// import router from "./router";
import HomePage from "./pages/HomePage"
import ConcatPage from "./pages/ConcatPage"
import { useRoutes, Routes, Route, Link } from "react-router-dom"
import logo from './logo.svg';
import './App.css';
import routes from "./routes"
import Head from "./head/head"
// const test = import("./pages/404");
// console.log(test);
// console.log(router);
console.log(routes);


export default function App (props) {
  const [count, setCount] = useState(0);  
  // const Routes = () =>useRoutes(routes);
  // return (
  //   <Routes />
  // )

  // useEffect(()=>{
  //   console.log(23333);
  //   createPortal(
  //     props.children,
  //     document.getElementById('portal')
  //   );
  // },[])

  return (
    <div className="App">            
      <header className="App-header">
        这里是revite 
        <Routes>
          {routes.map((route,index)=>{
            return (
              <Route 
                key={route.path+index}
                path={route.path}
                element={ <route.component /> }
              />
            )
          })}
        </Routes>
        <p><Link to="/">首页</Link></p>
        <p><Link to="/concat">联系我们</Link></p>
        <p><Link to="/about">关于我们</Link></p>
        <p><Link to="/404">404</Link></p>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        {/* <p>
          Page has been open for <code>{count}</code> seconds.
        </p> */}
        <p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </p>        
      </header>
    </div>
  );
}
