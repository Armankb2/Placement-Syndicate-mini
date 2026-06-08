import { useEffect, useState } from "react";
import { getMyProfile, getMyExperiences, getMyEnrollments } from "../services/api";
import "./ProfilePage.css";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Profile is critical. If it fails, the whole page fails.
      const profileRes = await getMyProfile();
      setProfile(profileRes.data);

      // Experiences and Enrollments are secondary. If they fail, we catch and default to empty arrays.
      try {
        const expRes = await getMyExperiences();
        setExperiences(expRes.data || []);
      } catch (err) {
        console.warn("Failed to fetch experiences:", err);
      }

      try {
        const enrollRes = await getMyEnrollments();
        setEnrollments(enrollRes.data || []);
      } catch (err) {
        console.warn("Failed to fetch enrollments:", err);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container animate-up">
        <div className="profile-dashboard-skeleton">
          {/* Skeleton Header */}
          <div className="skeleton-header glass-skeleton">
            <div className="skeleton-avatar pulse"></div>
            <div className="skeleton-header-info">
              <div className="skeleton-line skeleton-title pulse"></div>
              <div className="skeleton-line skeleton-subtitle pulse"></div>
              <div className="skeleton-line skeleton-meta pulse"></div>
            </div>
            <div className="skeleton-actions pulse"></div>
          </div>

          {/* Skeleton Stats Grid */}
          <div className="skeleton-stats-grid">
            <div className="skeleton-stat-card glass-skeleton pulse"></div>
            <div className="skeleton-stat-card glass-skeleton pulse"></div>
            <div className="skeleton-stat-card glass-skeleton pulse"></div>
            <div className="skeleton-stat-card glass-skeleton pulse"></div>
          </div>

          {/* Skeleton Layout Grid */}
          <div className="profile-grid">
            <div className="skeleton-section glass-skeleton pulse" style={{ height: "420px" }}></div>
            <div className="skeleton-section glass-skeleton pulse" style={{ height: "420px" }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container animate-up">
        <div className="profile-error-card glass">
          <div className="error-icon">⚠️</div>
          <h2>Unable to Load Profile</h2>
          <p className="error-desc">
            We encountered an issue fetching your account information. Please check your network connection or try again.
          </p>
          {error && <div className="error-raw-details">Reason: {error}</div>}
          <button onClick={fetchData} className="btn-primary retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const getProfileCompletion = () => {
    if (!profile) return 0;
    let score = 0;
    if (profile.firstname) score += 20;
    if (profile.lastname) score += 20;
    if (profile.email) score += 20;
    if (profile.role) score += 20;
    if (profile.id) score += 20;
    return score;
  };
  const completion = getProfileCompletion();

  return (
    <div className="container animate-up">
      <div className="profile-dashboard-layout">
        
        {/* Modern Header Section */}
        <header className="profile-hero-header glass">
          <div className="profile-avatar-gradient">
            <div className="profile-avatar-inner">
              {profile.firstname?.[0]?.toUpperCase() || ""}
              {profile.lastname?.[0]?.toUpperCase() || ""}
            </div>
          </div>
          <div className="profile-header-info">
            <div className="profile-name-row">
              <h1>{profile.firstname} {profile.lastname}</h1>
              <span className={`profile-badge-tag ${profile.role?.toLowerCase()}`}>
                {profile.role}
              </span>
            </div>
            <p className="profile-welcome-text">
              Welcome back to your workspace! Let's build your corporate portfolio.
            </p>
            <div className="profile-meta-row">
              <span className="meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                {profile.email}
              </span>
              <span className="meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Joined {new Date(profile.createdDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
          <div className="profile-header-actions">
            <button 
              className="btn-small edit-profile-mock-btn" 
              onClick={() => alert("Edit Profile functionality is read-only (synced from Keycloak ID provider).")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 6}}>
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              Edit Profile
            </button>
          </div>
        </header>

        {/* Quick Stats Section */}
        <div className="stats-dashboard-grid">
          <div className="stat-dashboard-card glass glass-hover">
            <div className="stat-card-header">
              <span className="stat-card-icon experiences-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </span>
              <span className="stat-card-title">Experiences Shared</span>
            </div>
            <div className="stat-card-body">
              <span className="stat-card-value">{experiences.length}</span>
              <span className="stat-card-change positive">Active Contributor</span>
            </div>
          </div>

          <div className="stat-dashboard-card glass glass-hover">
            <div className="stat-card-header">
              <span className="stat-card-icon programs-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
                </svg>
              </span>
              <span className="stat-card-title">Programs Enrolled</span>
            </div>
            <div className="stat-card-body">
              <span className="stat-card-value">{enrollments.length}</span>
              <span className="stat-card-change neutral">Enrolled</span>
            </div>
          </div>

          <div className="stat-dashboard-card glass glass-hover">
            <div className="stat-card-header">
              <span className="stat-card-icon resume-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </span>
              <span className="stat-card-title">Resume Uploads</span>
            </div>
            <div className="stat-card-body">
              <span className="stat-card-value">1</span>
              <span className="stat-card-change positive">AI advisor checked</span>
            </div>
          </div>

          <div className="stat-dashboard-card glass glass-hover">
            <div className="stat-card-header">
              <span className="stat-card-icon completion-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="6"></circle>
                  <circle cx="12" cy="12" r="2"></circle>
                </svg>
              </span>
              <span className="stat-card-title">Profile Completion</span>
            </div>
            <div className="stat-card-body">
              <span className="stat-card-value">{completion}%</span>
              <div className="completion-bar-wrapper">
                <div className="completion-bar-fill" style={{ width: `${completion}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Sections Grid */}
        <div className="profile-grid">
          
          {/* Profile Information Card */}
          <div className="profile-section-card glass">
            <h3 className="section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Account Overview
            </h3>
            <div className="account-details-list">
              <div className="detail-item">
                <span className="detail-label">First Name</span>
                <span className="detail-value">{profile.firstname || "—"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Last Name</span>
                <span className="detail-value">{profile.lastname || "—"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email Address</span>
                <span className="detail-value">{profile.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Workspace Role</span>
                <span className="detail-value role-badge-value">{profile.role}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">System ID</span>
                <span className="detail-value system-id-value">#{profile.id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Account Created</span>
                <span className="detail-value">
                  {new Date(profile.createdDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Achievements & Activities */}
          <div className="profile-sidebar-column">
            
            {/* Achievement Badges Section */}
            <div className="profile-section-card glass badges-card">
              <h3 className="section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                  <path d="M4 22h16"></path>
                  <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path>
                  <path d="M12 2a6 6 0 0 1 6 6v1H6V8a6 6 0 0 1 6-6z"></path>
                </svg>
                Achievement Badges
              </h3>
              <div className="badges-list">
                <div className="badge-item unlocked">
                  <span className="badge-emoji">🏆</span>
                  <div className="badge-info">
                    <h4>Profile Created</h4>
                    <p>Syndicate account successfully registered.</p>
                  </div>
                </div>
                <div className={`badge-item ${experiences.length > 0 || enrollments.length > 0 ? "unlocked" : "locked"}`}>
                  <span className="badge-emoji">🚀</span>
                  <div className="badge-info">
                    <h4>Active Member</h4>
                    <p>{experiences.length > 0 || enrollments.length > 0 ? "Engaged in preparation activities." : "Locked: Share an experience or enroll."}</p>
                  </div>
                </div>
                <div className={`badge-item ${experiences.length > 0 ? "unlocked" : "locked"}`}>
                  <span className="badge-emoji">💡</span>
                  <div className="badge-info">
                    <h4>Experience Contributor</h4>
                    <p>{experiences.length > 0 ? "Published an interview experience." : "Locked: Share your first experience."}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="profile-section-card glass activity-card">
              <h3 className="section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                Recent Activity
              </h3>
              <div className="activity-timeline">
                {experiences.length > 0 && (
                  <div className="timeline-item">
                    <div className="timeline-marker success animate-pulse"></div>
                    <div className="timeline-content">
                      <h4>Shared Interview Experience</h4>
                      <p>Contributed {experiences.length} interview reports to the public database.</p>
                    </div>
                  </div>
                )}
                {enrollments.length > 0 && (
                  <div className="timeline-item">
                    <div className="timeline-marker primary animate-pulse"></div>
                    <div className="timeline-content">
                      <h4>Mentorship Programs</h4>
                      <p>Enrolled in {enrollments.length} weekly mentoring circles.</p>
                    </div>
                  </div>
                )}
                <div className="timeline-item">
                  <div className="timeline-marker info"></div>
                  <div className="timeline-content">
                    <h4>Checked AI Resume Advisor</h4>
                    <p>Scanned resume score against corporate vectors.</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-marker default"></div>
                  <div className="timeline-content">
                    <h4>Joined Placement Syndicate</h4>
                    <p>Created workspace profile on {new Date(profile.createdDate).toLocaleDateString()}.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

