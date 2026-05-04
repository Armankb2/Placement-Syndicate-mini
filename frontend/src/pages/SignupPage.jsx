import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthPages.css";

export default function SignupPage() {
  const { authenticated, signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    year: 1,
  });
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
      await signup({ ...form, year: parseInt(form.year, 10) });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create account.");
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
          Join thousands of students sharing their journey and helping others crack their dream roles. 
          Start your story today.
        </p>
      </div>

      <div className="auth-form-container animate-right">
        <section className="auth-card">
          <span className="form-step">New Account</span>
          <h1>Create profile</h1>
          <p style={{ color: "#475569", marginBottom: "1rem" }}>
            Fill in your details to get started.
          </p>

          {error && <div className="error-message auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>First name</label>
                <input 
                  name="firstname" 
                  value={form.firstname} 
                  onChange={handleChange} 
                  placeholder="John"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Last name</label>
                <input 
                  name="lastname" 
                  value={form.lastname} 
                  onChange={handleChange} 
                  placeholder="Doe"
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input 
                name="email" 
                type="email" 
                value={form.email} 
                onChange={handleChange} 
                placeholder="john@example.com"
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

            <div className="form-group">
              <label>Current Year</label>
              <input 
                name="year" 
                type="number" 
                min="1" 
                max="4" 
                value={form.year} 
                onChange={handleChange} 
                required 
              />
            </div>

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Processing..." : "Create Account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in here</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
