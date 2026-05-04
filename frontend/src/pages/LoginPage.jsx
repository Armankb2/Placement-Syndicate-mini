import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthPages.css";

export default function LoginPage() {
  const { authenticated, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (authenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await login(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-branding animate-left">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        
        <h1 className="dynamic-text">Placement Syndicate</h1>
        <p className="branding-subtitle">
          Your all-in-one platform for interview experiences, resume building, and career growth. 
          Empowering the next generation of professionals.
        </p>
      </div>
      
      <div className="auth-form-container animate-right">
        <section className="auth-card">
          <span className="form-step">Member Login</span>
          <h1>Welcome back</h1>
          <p style={{ color: "#475569", marginBottom: "1rem" }}>
            Sign in to continue your journey.
          </p>

          {error && <div className="error-message auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                name="email" 
                type="email" 
                value={form.email} 
                onChange={handleChange} 
                placeholder="name@example.com"
                required 
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input 
                name="password" 
                type="password" 
                value={form.password} 
                onChange={handleChange} 
                placeholder="••••••••"
                required 
              />
            </div>

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Authenticating..." : "Sign In to Syndicate"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Join the community</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
