import React,{ useState } from 'react';
import { Link, Outlet } from "react-router-dom"
import Sider from "./Sider";
import logo192 from './logo192.png';
import "./home.css";

export default function HomePage(props) {
  const [count,setCount] = useState(2223);
  const { user={} } = props;
  console.log("home:data",props)
  return (
    <div className="home">
     <h3>这里是首页 开心哈哈哈</h3>
     <div className="main">
       <div className="content">
        <img src={logo192} className="image" alt="logo" />
        hello 我是 {user.name} , 年龄 {user.age}
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

export const getInitialProps = async () =>{
  // const res = await fetch('https://api.github.com/repos/vercel/next.js')
  // const json = await res.json();
  return {
    user:{
      name:"jack",
      age: 23,
      // next: json
    }
  }
}