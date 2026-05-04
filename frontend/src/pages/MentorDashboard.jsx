import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { createProgram, getMyPrograms, getEnrolledStudents } from "../services/api";
import "./MentorDashboard.css";

export default function MentorDashboard() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", date: "", time: "", duration: "", maxStudents: 10,
  });

  useEffect(() => { fetchMyPrograms(); }, []);

  const fetchMyPrograms = async () => {
    try { setLoading(true); const res = await getMyPrograms(); setPrograms(res.data); }
    catch (err) { console.error("Failed to load programs:", err); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "maxStudents" ? parseInt(value) || 0 : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.date || !form.time || !form.duration) {
      setMessage({ text: "Please fill in all fields", type: "error" }); return;
    }
    try {
      setSubmitting(true);
      await createProgram(form);
      setMessage({ text: "Program created successfully!", type: "success" });
      setForm({ title: "", description: "", date: "", time: "", duration: "", maxStudents: 10 });
      setShowForm(false);
      fetchMyPrograms();
    } catch (err) {
      setMessage({ text: err.response?.data?.error || "Failed to create program", type: "error" });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 4000);
    }
  };

  const viewStudents = async (programId) => {
    if (selectedProgram === programId) { setSelectedProgram(null); setStudents([]); return; }
    try {
      setLoadingStudents(true); setSelectedProgram(programId);
      const res = await getEnrolledStudents(programId); setStudents(res.data);
    } catch (err) { console.error("Failed to load students:", err); }
    finally { setLoadingStudents(false); }
  };

  return (
    <div className="container mentor-dashboard">
      <div className="page-header animate-up">
        <div>
          <h1 className="page-title">🎓 Mentor <span>Dashboard</span></h1>
          <p className="page-subtitle">Create programs and track student enrollments.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Cancel" : "＋ Create Program"}
        </button>
      </div>

      {message.text && (
        <div className={`status-message ${message.type} animate-up`} style={{ marginBottom: 20 }}>
          {message.type === "success" ? "✅" : "⚠️"} {message.text}
        </div>
      )}

      {showForm && (
        <div className="glass-card mentor-form animate-up">
          <h2 className="form-title">Create New Program</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Program Title</label>
                <input type="text" name="title" value={form.title} onChange={handleChange}
                  placeholder="e.g. System Design Masterclass" />
              </div>
              <div className="form-group full-width">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange}
                  placeholder="What students will learn..." rows={3} />
              </div>
              <div className="form-group"><label>Date</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} /></div>
              <div className="form-group"><label>Time</label>
                <input type="time" name="time" value={form.time} onChange={handleChange} /></div>
              <div className="form-group"><label>Duration</label>
                <input type="text" name="duration" value={form.duration} onChange={handleChange} placeholder="e.g. 2 hours" /></div>
              <div className="form-group"><label>Max Students</label>
                <input type="number" name="maxStudents" value={form.maxStudents} onChange={handleChange} min="1" /></div>
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Creating..." : "Create Program"}
            </button>
          </form>
        </div>
      )}

      <h2 className="section-label animate-up">My Programs <span className="count-badge">{programs.length}</span></h2>

      {loading ? (
        <div className="loader animate-up">Loading programs...</div>
      ) : programs.length === 0 ? (
        <div className="glass-card empty-state animate-up">
          <div className="icon">📋</div>
          <h3>No Programs Yet</h3>
          <p>Create your first mentorship program to get started.</p>
        </div>
      ) : (
        <div className="programs-grid">
          {programs.map((p, i) => (
            <div key={p.id} className="glass-card glass-hover program-card animate-up" style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="card-top-row">
                <h3>{p.title}</h3>
                <span className={`card-badge ${p.enrolledCount >= p.maxStudents ? "badge-danger" : "badge-primary"}`}>
                  {p.enrolledCount}/{p.maxStudents}
                </span>
              </div>
              <p className="card-desc">{p.description}</p>
              <div className="card-tags">
                <span className="tag">📅 {p.date}</span>
                <span className="tag">🕐 {p.time}</span>
                <span className="tag">⏱️ {p.duration}</span>
              </div>
              <button className="btn-small" onClick={() => viewStudents(p.id)}>
                {selectedProgram === p.id ? "Hide Students" : "View Students"}
              </button>
              {selectedProgram === p.id && (
                <div className="students-panel animate-slide-in">
                  {loadingStudents ? <p className="muted">Loading...</p> :
                    students.length === 0 ? <p className="muted">No students enrolled yet.</p> : (
                      <div className="student-list">
                        {students.map((s) => (
                          <div key={s.id} className="student-row">
                            <div className="student-avatar">{s.studentName?.charAt(0)?.toUpperCase() || "?"}</div>
                            <div><strong>{s.studentName}</strong>
                              <span className="muted"> — {s.enrolledDate ? new Date(s.enrolledDate).toLocaleDateString() : "—"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
