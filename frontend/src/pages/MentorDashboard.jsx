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
    domain: "", description: "", maxStudents: 10, availability: {}
  });
  const [currentDay, setCurrentDay] = useState("Monday");
  const [currentTime, setCurrentTime] = useState("10:00");

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

  const addAvailability = () => {
    if (!currentTime) return;
    setForm(prev => {
      const newAvail = { ...prev.availability };
      if (!newAvail[currentDay]) newAvail[currentDay] = [];
      if (!newAvail[currentDay].includes(currentTime)) {
        newAvail[currentDay].push(currentTime);
      }
      return { ...prev, availability: newAvail };
    });
  };

  const removeSlot = (day, time) => {
    setForm(prev => {
      const newAvail = { ...prev.availability };
      newAvail[day] = newAvail[day].filter(t => t !== time);
      if (newAvail[day].length === 0) delete newAvail[day];
      return { ...prev, availability: newAvail };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Merge existing availability with currently typed slot
    let finalAvailability = { ...form.availability };
    if (currentTime) {
      if (!finalAvailability[currentDay]) finalAvailability[currentDay] = [];
      if (!finalAvailability[currentDay].includes(currentTime)) {
        finalAvailability[currentDay].push(currentTime);
      }
    }

    if (!form.domain || !form.description || Object.keys(finalAvailability).length === 0) {
      setMessage({ text: "Please fill in all fields (Domain, Description, and Availability)", type: "error" }); 
      return;
    }

    try {
      setSubmitting(true);
      const payload = { ...form, availability: finalAvailability };
      await createProgram(payload);
      setMessage({ text: "Program created successfully!", type: "success" });
      setForm({ domain: "", description: "", maxStudents: 10, availability: {} });
      setCurrentTime("10:00");
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
                <label>Program Domain</label>
                <input type="text" name="domain" value={form.domain} onChange={handleChange}
                  placeholder="e.g. System Design, Web Dev, DSA" />
              </div>
              <div className="form-group full-width">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange}
                  placeholder="What students will learn..." rows={3} />
              </div>
              
              <div className="form-group full-width availability-manager">
                <label>Weekly Availability (Day & Time)</label>
                <div className="availability-controls">
                  <select value={currentDay} onChange={(e) => setCurrentDay(e.target.value)}>
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <input type="time" value={currentTime} onChange={(e) => setCurrentTime(e.target.value)} />
                  <button type="button" className="btn-small" onClick={addAvailability}>Add More</button>
                </div>
                
                {Object.keys(form.availability).length > 0 && (
                  <div className="slots-preview">
                    {Object.entries(form.availability).map(([day, times]) => (
                      <div key={day} className="day-group">
                        <strong>{day}:</strong>
                        {times.map(t => (
                          <span key={t} className="slot-tag">
                            {t} <span className="remove" onClick={() => removeSlot(day, t)}>×</span>
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
                <h3>{p.domain}</h3>
                <span className={`card-badge ${p.enrolledCount >= p.maxStudents ? "badge-danger" : "badge-primary"}`}>
                  {p.enrolledCount}/{p.maxStudents}
                </span>
              </div>
              <p className="card-desc">{p.description}</p>
              <div className="card-tags">
                {p.availability && Object.entries(p.availability).map(([day, times]) => (
                  <span key={day} className="tag">📅 {day}: {times.join(", ")}</span>
                ))}
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
