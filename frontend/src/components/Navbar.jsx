import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getShortName } from "../utils/displayName";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  const isActive = (path) => location.pathname === path;
  const displayName = getShortName(user, "Profile");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/" className="logo-text">
          <span className="logo-mark">PS</span>
          <span className="logo-copy">Placement Syndicate</span>
        </Link>
      </div>

      <div className="nav-links">
        <Link to="/" className={`nav-item ${isActive("/") ? "active" : ""}`}>Dashboard</Link>
        <Link to="/experiences" className={`nav-item ${isActive("/experiences") ? "active" : ""}`}>Experiences</Link>
        <Link to="/my-experiences" className={`nav-item ${isActive("/my-experiences") ? "active" : ""}`}>Mine</Link>
        <Link to="/experiences/new" className={`nav-item ${isActive("/experiences/new") ? "active" : ""}`}>Share</Link>
        <Link to="/upload-resume" className={`nav-item ${isActive("/upload-resume") ? "active" : ""}`}>AI Advisor</Link>
        <Link to="/programs" className={`nav-item ${isActive("/programs") ? "active" : ""}`}>Programs</Link>
        
        {hasRole("MENTOR") || hasRole("ADMIN") ? (
          <Link to="/mentor-dashboard" className={`nav-item ${isActive("/mentor-dashboard") ? "active" : ""}`}>Mentor</Link>
        ) : null}

        {hasRole("STUDENT") || hasRole("ADMIN") ? (
          <Link to="/my-enrollments" className={`nav-item ${isActive("/my-enrollments") ? "active" : ""}`}>Enrollments</Link>
        ) : null}
      </div>

      <div className="nav-user">
        <div className="user-info">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          {user ? (
            <>
            <div className="user-pill">
              <Link to="/profile" className="user-name">
                {displayName}
              </Link>
              <span className={`role-badge ${user.role?.toLowerCase()}`}>
                {user.role}
              </span>
            </div>
              <button className="logout-btn" onClick={logout}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="user-name">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
