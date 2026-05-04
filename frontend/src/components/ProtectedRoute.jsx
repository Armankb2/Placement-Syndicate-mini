import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ role, children }) {
  const { authenticated, hasRole } = useAuth();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && !hasRole(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

