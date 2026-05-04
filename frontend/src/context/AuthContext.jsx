/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as loginRequest, setAuthToken, signup as signupRequest } from "../services/api";

const AuthContext = createContext(null);
const TOKEN_KEY = "placement_token";
const USER_KEY = "placement_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

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
  };

  const signup = async (payload) => {
    const response = await signupRequest(payload);
    persistSession(response.data);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setAuthToken(null);
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
