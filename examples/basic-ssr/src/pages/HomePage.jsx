import React,{ useState } from 'react';
import { Link, Outlet } from "react-router-dom"
import { Head } from "@revite/components"
import { Button } from '@material-ui/core';
// import styled from "styled-components";
import Sider from "./Sider";
import logo192 from './logo192.png';
import logo from './logo.svg';
import "./home.css";

// const StyleButton = styled.button`
//   color: #f66;
// `;

export default function HomePage(props) {
  const [count,setCount] = useState(2223);
  const { user={} } = props;
  // console.log("home:data",props)
  return (
    <div className="home">
     <Head>
        <title>Ssr App title</title>
        <meta charSet="UTF-8" />
        <meta property="og:title" content="My page title2333" key="title" />
     </Head>
     <h3>这里是首页 啊哈</h3>
     <div className="main">
       <div className="content">
        <Button variant="contained" color="primary">我是按钮</Button>
        {/* <StyleButton>style button</StyleButton> */}
        <img src={logo192} className="image" alt="logo" />
        <img src={logo} className="image" alt="logo" />
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