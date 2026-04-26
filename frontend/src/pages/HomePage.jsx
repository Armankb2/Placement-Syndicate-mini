import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./HomePage.css";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="container animate-up">
      <header className="hero-section">
        <h1 className="hero-title">Welcome to the <span>Syndicate</span></h1>
        <p className="hero-subtitle">
          Hello <strong>{user?.name}</strong>. Your professional journey continues here. 
          Browse experiences, get AI-powered advice, and land your dream role.
        </p>
      </header>

      <div className="bento-grid">
        <Link to="/upload-resume" className="bento-card glass glass-hover large-card">
          <div className="card-content">
            <span className="card-icon">🧠</span>
            <h3>AI Resume Advisor</h3>
            <p>Get instant, vector-matched feedback on your resume based on successful interview experiences.</p>
            <span className="card-badge">New Feature</span>
          </div>
        </Link>

        <Link to="/experiences" className="bento-card glass glass-hover">
          <div className="card-content">
            <span className="card-icon">💼</span>
            <h3>Browse Experiences</h3>
            <p>Explore real-world interview questions and tips from top tech companies.</p>
          </div>
        </Link>

        <Link to="/experiences/new" className="bento-card glass glass-hover">
          <div className="card-content">
            <span className="card-icon">📝</span>
            <h3>Add Experience</h3>
            <p>Share your interview journey and help others in the community.</p>
          </div>
        </Link>

        <Link to="/profile" className="bento-card glass glass-hover">
          <div className="card-content">
            <span className="card-icon">👤</span>
            <h3>Profile Dashboard</h3>
            <p>Manage your account settings and view your contributions.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
