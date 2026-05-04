import { useState, useEffect } from "react";
import { getAllPrograms, enrollInProgram } from "../services/api";
import "./BrowsePrograms.css";

export default function BrowsePrograms() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [search, setSearch] = useState("");

  useEffect(() => { fetchPrograms(); }, []);

  const fetchPrograms = async () => {
    try { setLoading(true); const res = await getAllPrograms(); setPrograms(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleEnroll = async (id) => {
    try {
      setEnrollingId(id); await enrollInProgram(id);
      setMessage({ text: "Successfully enrolled! 🎉", type: "success" }); fetchPrograms();
    } catch (err) {
      setMessage({ text: err.response?.data?.error || "Failed to enroll", type: "error" });
    } finally { setEnrollingId(null); setTimeout(() => setMessage({ text: "", type: "" }), 4000); }
  };

  const filtered = programs.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.mentorName?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container browse-programs">
      <div className="page-header animate-up">
        <div>
          <h1 className="page-title">🚀 Mentorship <span>Programs</span></h1>
          <p className="page-subtitle">Browse and enroll in programs from experienced mentors.</p>
        </div>
      </div>

      <div className="search-wrap animate-up">
        <input type="text" placeholder="Search by title, mentor, or description..." value={search}
          onChange={(e) => setSearch(e.target.value)} />
      </div>

      {message.text && (
        <div className={`status-message ${message.type} animate-up`} style={{ marginBottom: 20 }}>
          {message.type === "success" ? "✅" : "⚠️"} {message.text}
        </div>
      )}

      {loading ? (
        <div className="loader animate-up">Loading programs...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card empty-state animate-up">
          <div className="icon">📭</div>
          <h3>{search ? "No matching programs" : "No Programs Available"}</h3>
          <p>{search ? "Try different search terms." : "Check back later."}</p>
        </div>
      ) : (
        <div className="bp-grid">
          {filtered.map((p, i) => {
            const isFull = p.enrolledCount >= p.maxStudents;
            const spots = p.maxStudents - p.enrolledCount;
            return (
              <div key={p.id} className="glass-card glass-hover bp-card animate-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="bp-top">
                  <div className="bp-mentor">
                    <div className="bp-avatar">{p.mentorName?.charAt(0)?.toUpperCase() || "M"}</div>
                    <span>{p.mentorName || "Mentor"}</span>
                  </div>
                  <span className={`card-badge ${isFull ? "badge-danger" : spots <= 3 ? "badge-warning" : "badge-success"}`}>
                    {isFull ? "FULL" : `${spots} spot${spots !== 1 ? "s" : ""}`}
                  </span>
                </div>
                <h3 className="bp-title">{p.title}</h3>
                <p className="bp-desc">{p.description}</p>
                <div className="bp-tags">
                  <span className="tag">📅 {p.date}</span>
                  <span className="tag">🕐 {p.time}</span>
                  <span className="tag">⏱️ {p.duration}</span>
                  <span className="tag">👥 {p.enrolledCount}/{p.maxStudents}</span>
                </div>
                <div className="bp-bar-wrap">
                  <div className={`bp-bar ${isFull ? "bar-full" : ""}`}
                    style={{ width: `${(p.enrolledCount / p.maxStudents) * 100}%` }} />
                </div>
                <button className={isFull ? "btn-disabled" : "btn-primary"}
                  onClick={() => !isFull && handleEnroll(p.id)}
                  disabled={isFull || enrollingId === p.id}>
                  {enrollingId === p.id ? "Enrolling..." : isFull ? "Program Full" : "Enroll Now"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
