import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ role, children }) {
  const { hasRole } = useAuth();

  if (role && !hasRole(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

