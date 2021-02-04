import React, { useState, useEffect } from 'react';
// import router from "./router";
import HomePage from "./pages/HomePage"
import ConcatPage from "./pages/ConcatPage"
import { useRoutes } from "react-router-dom"
import logo from './logo.svg';
import './App.css';
import routes from "./routes"
// const test = import("./pages/404");
// console.log(test);
// console.log(router);
console.log(routes);


export default function App () {
  const [count, setCount] = useState(0);  
  const Routes = () =>useRoutes(routes);
  return (
    <Routes />
  )
  return (
    <div className="App">      
      <header className="App-header">
        这里是revite 
        {/* <HomePage />
        <ConcatPage /> */}
        <Routes />
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <p>
          Page has been open for <code>{count}</code> seconds.
        </p>
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
