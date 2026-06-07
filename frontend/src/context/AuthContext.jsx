/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as loginRequest, setAuthToken, signup as signupRequest } from "../services/api";

const AuthContext = createContext(null);
const TOKEN_KEY = "placement_token";
const USER_KEY = "placement_user";

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

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken && isTokenExpired(storedToken)) {
      console.warn("Stored JWT token has expired. Clearing session.");
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return null;
    }
    return storedToken;
  });

  const [user, setUser] = useState(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken || isTokenExpired(storedToken)) {
      return null;
    }
    const storedUser = localStorage.getItem(USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    const handleUnauthorized = () => {
      console.warn("Unauthorized API call detected. Logging user out.");
      logout();
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const persistSession = (authResponse) => {
    const nextToken = authResponse.token;
    const nextUser = normalizeUser(authResponse.user);

    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const login = async (credentials) => {
    const response = await loginRequest(credentials);
    persistSession(response.data);
    console.log("User successfully logged in:", response.data?.user?.email);
  };

  const signup = async (payload) => {
    const response = await signupRequest(payload);
    persistSession(response.data);
    console.log("User successfully signed up:", response.data?.user?.email);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setAuthToken(null);
    console.log("User session cleared (logout).");
  };

  const hasRole = (role) => user?.roles?.includes(role) || user?.role === role;

  const value = useMemo(
    () => ({
      authenticated: Boolean(token),
      token,
      user,
      login,
      signup,
      logout,
      hasRole,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function normalizeUser(userResponse) {
  return {
    sub: userResponse?.id,
    name: userResponse?.firstname || userResponse?.email,
    email: userResponse?.email,
    role: userResponse?.role,
    roles: userResponse?.role ? [userResponse.role] : [],
  };
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
