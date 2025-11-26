// MenteeRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const MenteeRoute = ({ children }) => {
  const userRole = localStorage.getItem("userRole");
  // const userId = localStorage.getItem("userId"); // ❌ KHÔNG CẦN DÙNG HIỆN TẠI

  // ✅ UPDATED: chỉ cần kiểm tra đúng role mentee
  if (!userRole || userRole !== "mentee") {
    return <Navigate to="/" replace />;
  }

  // Hợp lệ → render route
  return children ? children : <Outlet />;
};

export default MenteeRoute;
