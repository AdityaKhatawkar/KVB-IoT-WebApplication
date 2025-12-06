import React from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface Props {
  children: React.ReactNode;
  role?: "user" | "admin";
}

export default function ProtectedRoute({ children, role }: Props) {
  const token = Cookies.get("token");

  // No token → send to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  interface JwtPayload {
    role?: "user" | "admin";
    [key: string]: unknown;
  }

  let payload: JwtPayload;
  try {
    payload = jwtDecode<JwtPayload>(token);
  } catch {
    return <Navigate to="/login" replace />;
  }

  // If role is specified → check it
  if (role && payload.role !== role) {
    if (payload.role === "admin") return <Navigate to="/admin-dashboard" replace />;
    if (payload.role === "user") return <Navigate to="/user-dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}
