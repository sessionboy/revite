import React, { useState, useEffect } from 'react';
import logo192 from './logo192.png';
// import "./home.scss";

const HomePage = () => {
  const [count,setCount] = useState(2223)
  // console.log(count);
  return (
    <div className="home">
      这里是首页 唔哈哈哈，那个啥
     <img src={logo192} className="image" alt="logo" />
    </div>
  );
}

export default HomePage;
