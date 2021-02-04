import React from 'react';
import { Link, Outlet } from "react-router-dom"

export default function ConcatPage () {
  return (
    <div>
      关于我们
      <Outlet />
    </div>
  )
}