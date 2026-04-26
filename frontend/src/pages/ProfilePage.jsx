import { useEffect, useState } from "react";
import { getMyProfile } from "../services/api";
import "./ProfilePage.css";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyProfile()
      .then((res) => setProfile(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader">Loading your workspace...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!profile) return <div className="error-message">No profile profile found.</div>;

  return (
    <div className="container animate-up">
      <div className="profile-dashboard glass">
        <header className="profile-header">
          <div className="avatar-large">{profile.firstname[0]}</div>
          <div className="header-info">
            <h1>{profile.firstname} {profile.lastname}</h1>
            <p className="role-tag">{profile.role}</p>
          </div>
        </header>

        <div className="profile-grid">
          <section className="profile-section">
            <h3>Account Details</h3>
            <div className="detail-row">
              <span className="label">Email</span>
              <span className="value">{profile.email}</span>
            </div>
            <div className="detail-row">
              <span className="label">System ID</span>
              <span className="value">#{profile.id.slice(-8)}</span>
            </div>
            <div className="detail-row">
              <span className="label">Joined</span>
              <span className="value">{new Date(profile.createdDate).toLocaleDateString()}</span>
            </div>
          </section>

          <section className="profile-section stats-section">
            <h3>Contribution Stats</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-val">12</span>
                <span className="stat-label">Experiences</span>
              </div>
              <div className="stat-card">
                <span className="stat-val">4</span>
                <span className="stat-label">AI Analyses</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
