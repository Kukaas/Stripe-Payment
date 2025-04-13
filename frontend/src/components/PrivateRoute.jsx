import { useAuth } from "@/lib/hooks/AuthContext";
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if(loading) return (
    <div className="flex items-center justify-center h-screen">
      <svg
        className="animate-spin h-5 w-5 text-gray-500"
        viewBox="0 0 24 24"
      ></svg>
    </div>
  ); 
  // Check if user exists (is authenticated)
  if (!user) return <Navigate to="/login" />;
  
  return <Outlet />;
};

export default PrivateRoute;