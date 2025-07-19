// src/Layout.js
import React from "react";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="d-flex">
      <Sidebar />
      <div style={{ flex: 1, padding: "20px" }}>{children}</div>
    </div>
  );
};

export default Layout;
