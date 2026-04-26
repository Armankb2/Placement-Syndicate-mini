import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar glass">
      <div className="nav-brand">
        <Link to="/" className="logo-text">PLACEMENT <span>SYNDICATE</span></Link>
      </div>

      <div className="nav-links">
        <Link to="/" className={`nav-item ${isActive("/") ? "active" : ""}`}>Home</Link>
        <Link to="/experiences" className={`nav-item ${isActive("/experiences") ? "active" : ""}`}>Experiences</Link>
        <Link to="/my-experiences" className={`nav-item ${isActive("/my-experiences") ? "active" : ""}`}>My Experiences</Link>
        <Link to="/experiences/new" className={`nav-item ${isActive("/experiences/new") ? "active" : ""}`}>Add Experience</Link>
        <Link to="/upload-resume" className={`nav-item ${isActive("/upload-resume") ? "active" : ""}`}>AI Advisor</Link>
        {hasRole("Admin") && (
          <Link to="/admin" className={`nav-item ${isActive("/admin") ? "active" : ""}`}>Admin</Link>
        )}
      </div>

      <div className="nav-user">
        <div className="user-info">
          <Link to="/profile" className="user-name">
            {user?.name?.split(' ')[0]}
          </Link>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}
