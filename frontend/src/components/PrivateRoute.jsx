import { useAuth } from "@/lib/hooks/AuthContext";
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if(loading) return <div>Loading...</div>; 
  // Check if user exists (is authenticated)
  if (!user) return <Navigate to="/login" />;
  
  return <Outlet />;
};

export default PrivateRoute;