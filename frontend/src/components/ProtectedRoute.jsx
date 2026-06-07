import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

function isTokenExpired(token) {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    if (!decoded || !decoded.exp) return true;
    return decoded.exp * 1000 < Date.now();
  } catch (e) {
    return true;
  }
}

export default function ProtectedRoute({ role, children }) {
  const { authenticated, token, hasRole, logout } = useAuth();

  if (!authenticated || isTokenExpired(token)) {
    if (token) {
      console.warn("ProtectedRoute: Stored token has expired. Redirecting to login.");
      // Fire-and-forget logout to clear application/local state
      setTimeout(() => {
        logout();
      }, 0);
      return (
        <Navigate
          to="/login"
          state={{ message: "Your session has expired. Please sign in again." }}
          replace
        />
      );
    }
    return <Navigate to="/login" replace />;
  }

  if (role && !hasRole(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

