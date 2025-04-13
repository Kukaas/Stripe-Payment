import { useAuth } from "@/lib/hooks/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const { user, loading } = useAuth();
  
  // If user is authenticated, redirect to dashboard
  if (!loading && user) {
    return <Navigate to="/dashboard" />;
  }
  
  // Otherwise, render the public route
  return <Outlet />;
};

export default PublicRoute;