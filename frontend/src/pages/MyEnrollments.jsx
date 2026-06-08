import { useState, useEffect } from "react";
import { getMyEnrollments } from "../services/api";
import "./MyEnrollments.css";

export default function MyEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchEnrollments(); }, []);

  const fetchEnrollments = async () => {
    try { 
      setLoading(true); 
      const res = await getMyEnrollments(); 
      setEnrollments(res.data || []); 
    }
    catch (err) { 
      console.error("Failed to fetch enrollments:", err); 
    }
    finally { 
      setLoading(false); 
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not Available";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Not Available";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container my-enrollments">
      
      {/* Header section */}
      <div className="page-header animate-up">
        <div>
          <h1 className="page-title">📚 My <span>Enrollments</span></h1>
          <p className="page-subtitle">Track all the mentorship programs you've enrolled in.</p>
        </div>
        <span className="count-badge">{enrollments.length} Program{enrollments.length !== 1 ? "s" : ""}</span>
      </div>

      {loading ? (
        <div className="loader animate-up">Loading enrollments...</div>
      ) : enrollments.length === 0 ? (
        <div className="glass-card empty-state animate-up">
          <div className="icon">🎒</div>
          <h3>No Enrollments Yet</h3>
          <p>Browse available programs and enroll to start learning.</p>
        </div>
      ) : (
        <div className="enroll-cards-grid">
          {enrollments.map((e, i) => (
            <div 
              key={e.id} 
              className="glass-card glass-hover enroll-card animate-up"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className="enroll-card-header">
                <div className="enroll-card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10l-6-3-6 3M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
                  </svg>
                </div>
                <span className="enroll-card-status">✅ Enrolled</span>
              </div>

              <div className="enroll-card-body">
                <h3>{e.programTitle}</h3>
                
                <div className="enroll-card-meta">
                  <div className="meta-row">
                    <span className="meta-label">Enrollment ID:</span>
                    <span className="meta-value monospace">{e.id?.slice(0, 8)}...</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Enrolled Date:</span>
                    <span className="meta-value">{formatDate(e.enrolledDate)}</span>
                  </div>
                </div>

                {/* Visual Progress Bar (demo only) */}
                <div className="enroll-progress-section">
                  <div className="progress-info">
                    <span className="progress-label">Syllabus Progress</span>
                    <span className="progress-percentage">100%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: "100%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
