import React, { useState, useEffect } from 'react';
import Head from "../head"
import logo192 from './logo192.png';
// import "./home.scss";

const HomePage = () => {
  const [count,setCount] = useState(2223)
  // console.log(count);
  return (
    <div className="home">
      <Head>
        <title>我是首页哟</title>
        {/* <link rel="stylesheet" href="/style.css" /> */}
        <meta charSet="UTF-8" />
        <meta property="og:title" content="My page title2333" key="title" />
      </Head>
      这里是首页 唔哈哈哈，那个啥
     {/* <img src={logo192} className="image" alt="logo" /> */}
    </div>
  );
}

export default HomePage;
