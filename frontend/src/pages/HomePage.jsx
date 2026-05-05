import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getShortName } from "../utils/displayName";
import "./HomePage.css";

export default function HomePage() {
  const { user } = useAuth();
  const firstName = getShortName(user);

  return (
    <div className="container animate-up">
      <header className="hero-section">
        <div className="hero-kicker">Placement preparation workspace</div>
        <h1 className="hero-title">Welcome back, {firstName}.</h1>
        <p className="hero-subtitle">
          Browse real interview reports, compare company patterns, publish your own journey,
          and run your resume through the AI advisor before the next opportunity opens.
        </p>
        <div className="hero-actions">
          <Link to="/experiences" className="btn-primary">Browse experiences</Link>
          <Link to="/upload-resume" className="btn-small">Open AI advisor</Link>
        </div>
      </header>

      <section className="snapshot-grid">
        <div className="snapshot-item">
          <span className="snapshot-value">4</span>
          <span className="snapshot-label">Core tools</span>
        </div>
        <div className="snapshot-item">
          <span className="snapshot-value">AI</span>
          <span className="snapshot-label">Resume matching</span>
        </div>
        <div className="snapshot-item">
          <span className="snapshot-value">24x7</span>
          <span className="snapshot-label">Shared prep library</span>
        </div>
      </section>

      <div className="bento-grid">
        <Link to="/upload-resume" className="bento-card glass glass-hover large-card">
          <div className="card-content">
            <span className="card-icon">AI</span>
            <h3>AI Resume Advisor</h3>
            <p>Get instant, vector-matched feedback on your resume based on successful interview experiences.</p>
            <span className="card-badge">New Feature</span>
          </div>
        </Link>

        <Link to="/experiences" className="bento-card glass glass-hover">
          <div className="card-content">
            <span className="card-icon">EX</span>
            <h3>Browse Experiences</h3>
            <p>Explore real-world interview questions and tips from top tech companies.</p>
          </div>
        </Link>

        <Link to="/experiences/new" className="bento-card glass glass-hover">
          <div className="card-content">
            <span className="card-icon">SH</span>
            <h3>Add Experience</h3>
            <p>Share your interview journey and help others in the community.</p>
          </div>
        </Link>

        <Link to="/profile" className="bento-card glass glass-hover">
          <div className="card-content">
            <span className="card-icon">ME</span>
            <h3>Profile Dashboard</h3>
            <p>Manage your account settings and view your contributions.</p>
          </div>
        </Link>

        <Link to="/mentor-dashboard" className="bento-card glass glass-hover">
          <div className="card-content">
            <span className="card-icon">MN</span>
            <h3>Mentor Connect</h3>
            <p>Connect with experienced mentors for personalized guidance and mock interviews.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
