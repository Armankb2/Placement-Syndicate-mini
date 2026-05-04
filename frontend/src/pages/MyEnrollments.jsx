import { useState, useEffect } from "react";
import { getMyEnrollments } from "../services/api";
import "./MyEnrollments.css";

export default function MyEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchEnrollments(); }, []);

  const fetchEnrollments = async () => {
    try { setLoading(true); const res = await getMyEnrollments(); setEnrollments(res.data); }
    catch (err) { console.error("Failed to fetch enrollments:", err); }
    finally { setLoading(false); }
  };

  return (
    <div className="container my-enrollments">
      <div className="page-header animate-up">
        <div>
          <h1 className="page-title">📚 My <span>Enrollments</span></h1>
          <p className="page-subtitle">Track all the mentorship programs you've enrolled in.</p>
        </div>
        <span className="count-badge">{enrollments.length} enrollment{enrollments.length !== 1 ? "s" : ""}</span>
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
        <div className="enroll-list">
          {enrollments.map((e, i) => (
            <div key={e.id} className="glass-card glass-hover enroll-row animate-up"
              style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="enroll-left">
                <div className="enroll-num">{i + 1}</div>
                <div className="enroll-info">
                  <h3>{e.programTitle}</h3>
                  <div className="enroll-meta">
                    <span className="tag">📅 {e.enrolledDate
                      ? new Date(e.enrolledDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                      : "—"}</span>
                    <span className="tag">🆔 {e.programId?.slice(0, 8)}...</span>
                  </div>
                </div>
              </div>
              <span className="enroll-status">✅ Enrolled</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
