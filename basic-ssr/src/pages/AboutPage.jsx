import React from 'react';
import { Link, Outlet } from "react-router-dom"

export default function AboutPage (props) {
  console.log("about:data",props);
  return (
    <div>
      关于我们
      <Outlet />
    </div>
  )
}

export const getInitialProps = async () =>{
  return {
    data:{
      title:"about jack",
    }
  }
}