import React from 'react';
import { Link, Outlet } from "react-router-dom"
import Sider from "./Sider";
import logo192 from './logo192.png';
import "./home.css";

export default function HomePage() {
  return (
    <div className="home">
     <h3>这里是首页 哈a</h3>
     <div className="main">
       <div className="content">
        <img src={logo192} className="image" alt="logo" />
        <p><Link to="/concat">联系我们 </Link></p>
        <p><Link to="/about">关于我们</Link></p>
       </div>
       <div className="sider">
        <Sider />
       </div>             
     </div>
     <div className="footer">
       <Outlet />
     </div>
    </div>
  );
}

export const getInitialProps = () =>{
  return {
    user:{
      name:"jack",
      age: 23
    }
  }
}