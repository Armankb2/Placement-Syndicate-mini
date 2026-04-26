import { createContext, useContext, useEffect, useState, useRef } from "react";
import keycloak from "../keycloak";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const redirectUri = window.location.origin + "/";
    console.log("🔐 Keycloak init with redirect URI:", redirectUri);
    console.log("🔐 Keycloak realm:", keycloak.realm);
    console.log("🔐 Keycloak clientId:", keycloak.clientId);

    keycloak
      .init({
        onLoad: "login-required",
        checkLoginIframe: false,
        redirectUri: redirectUri,
      })
      .then((auth) => {
        console.log("✅ Keycloak authenticated:", auth);
        setAuthenticated(auth);
        setToken(keycloak.token);
        setUser({
          sub: keycloak.tokenParsed?.sub,
          name: keycloak.tokenParsed?.preferred_username,
          email: keycloak.tokenParsed?.email,
          roles: keycloak.tokenParsed?.realm_access?.roles || [],
        });
        setLoading(false);

        // Auto-refresh token
        setInterval(() => {
          keycloak
            .updateToken(30)
            .then((refreshed) => {
              if (refreshed) {
                setToken(keycloak.token);
              }
            })
            .catch(() => keycloak.logout());
        }, 30000);
      })
      .catch((err) => {
        console.error("❌ Keycloak init failed:", err);
        console.error("Full error:", JSON.stringify(err, null, 2));
        setLoading(false);
      });
  }, []);

  const logout = () => keycloak.logout({ redirectUri: window.location.origin + "/" });

  const hasRole = (role) => user?.roles?.includes(role) || false;

  if (loading) return <div>Loading authentication...</div>;
  if (!authenticated) return <div>Unable to authenticate.</div>;

  return (
    <AuthContext.Provider value={{ token, user, logout, hasRole, keycloak }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

