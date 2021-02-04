import React from 'react';
import { Link, Outlet } from "react-router-dom"

export default function ConcatPage () {
  return (
    <div>
      联系我们，地址是：<Outlet />
    </div>
  )
}