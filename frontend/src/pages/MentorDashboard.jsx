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
    try { setLoading(true); const res = await getMyPrograms(); setPrograms(res.data || []); }
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
      const res = await getEnrolledStudents(programId); setStudents(res.data || []);
    } catch (err) { console.error("Failed to load students:", err); }
    finally { setLoadingStudents(false); }
  };

  // Stats Calculations from fetched programs array
  const programsCreated = programs.length;
  const totalStudents = programs.reduce((sum, p) => sum + (p.enrolledCount || 0), 0);
  const totalSeats = programs.reduce((sum, p) => sum + (p.maxStudents || 0), 0);
  const availableSeats = programs.reduce((sum, p) => sum + Math.max(0, (p.maxStudents || 0) - (p.enrolledCount || 0)), 0);
  const utilization = totalSeats > 0 ? Math.round((totalStudents / totalSeats) * 100) : 0;

  // Keyword-based Difficulty Badge Assigner
  const getDifficultyLevel = (domain) => {
    if (!domain) return { text: "Beginner", class: "easy" };
    const domainLower = domain.toLowerCase();
    if (
      domainLower.includes("system design") || 
      domainLower.includes("advanced") || 
      domainLower.includes("architecture") || 
      domainLower.includes("expert") || 
      domainLower.includes("high-level")
    ) {
      return { text: "Advanced", class: "hard" };
    }
    if (
      domainLower.includes("dsa") || 
      domainLower.includes("algo") || 
      domainLower.includes("react") || 
      domainLower.includes("web") || 
      domainLower.includes("database") || 
      domainLower.includes("sql") || 
      domainLower.includes("network")
    ) {
      return { text: "Intermediate", class: "medium" };
    }
    return { text: "Beginner", class: "easy" };
  };

  // Extract dynamically generated upcoming session based on availability
  const getUpcomingSession = () => {
    if (programs.length === 0) {
      return {
        domain: "System Design Prep",
        day: "Monday",
        time: "10:00 AM",
        available: true
      };
    }
    const firstProg = programs[0];
    if (firstProg.availability && Object.keys(firstProg.availability).length > 0) {
      const day = Object.keys(firstProg.availability)[0];
      const times = firstProg.availability[day];
      if (times && times.length > 0) {
        const timeParts = times[0].split(":");
        let timeStr = times[0];
        if (timeParts.length >= 2) {
          const hour = parseInt(timeParts[0]);
          const minute = timeParts[1];
          const ampm = hour >= 12 ? "PM" : "AM";
          const displayHour = hour % 12 || 12;
          timeStr = `${displayHour}:${minute} ${ampm}`;
        }
        return {
          domain: firstProg.domain,
          day: day,
          time: timeStr,
          available: true
        };
      }
    }
    return {
      domain: firstProg.domain,
      day: "Upcoming",
      time: "Schedule Not Defined",
      available: false
    };
  };
  const upcomingSession = getUpcomingSession();

  return (
    <div className="container mentor-dashboard">
      
      {/* Header section */}
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

      {/* Program Create Form */}
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
                  <button type="button" className="btn-small" onClick={addAvailability}>Add Slot</button>
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

      {/* Stats Cards Section */}
      <div className="mentor-stats-grid animate-up">
        <div className="mentor-stat-card glass">
          <div className="mentor-stat-header">
            <span className="mentor-stat-icon icon-created">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
            </span>
            <span className="mentor-stat-label">Programs Created</span>
          </div>
          <span className="mentor-stat-value">{programsCreated}</span>
        </div>

        <div className="mentor-stat-card glass">
          <div className="mentor-stat-header">
            <span className="mentor-stat-icon icon-students">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </span>
            <span className="mentor-stat-label">Total Students</span>
          </div>
          <span className="mentor-stat-value">{totalStudents}</span>
        </div>

        <div className="mentor-stat-card glass">
          <div className="mentor-stat-header">
            <span className="mentor-stat-icon icon-seats">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
            </span>
            <span className="mentor-stat-label">Available Seats</span>
          </div>
          <span className="mentor-stat-value">{availableSeats}</span>
        </div>

        <div className="mentor-stat-card glass">
          <div className="mentor-stat-header">
            <span className="mentor-stat-icon icon-utilization">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
              </svg>
            </span>
            <span className="mentor-stat-label">Seat Utilization</span>
          </div>
          <div className="mentor-stat-util-wrapper">
            <span className="mentor-stat-value">{utilization}%</span>
            <div className="mentor-stat-progress-bar">
              <div className="mentor-stat-progress-fill" style={{ width: `${utilization}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content Area */}
      <div className="mentor-dashboard-grid animate-up">
        
        {/* Left Section: Programs Grid */}
        <div className="mentor-programs-column">
          <h2 className="section-label">My Programs <span className="count-badge">{programs.length}</span></h2>

          {loading ? (
            <div className="loader">Loading programs...</div>
          ) : programs.length === 0 ? (
            <div className="glass-card empty-state">
              <div className="icon">📋</div>
              <h3>No Programs Yet</h3>
              <p>Create your first mentorship program to get started.</p>
            </div>
          ) : (
            <div className="programs-list-wrapper">
              {programs.map((p, i) => {
                const diff = getDifficultyLevel(p.domain);
                const seatsLeft = Math.max(0, p.maxStudents - p.enrolledCount);
                return (
                  <div key={p.id} className="glass-card glass-hover program-card" style={{ animationDelay: `${i * 0.07}s` }}>
                    <div className="card-top-row">
                      <div>
                        <span className={`diff-badge ${diff.class}`}>{diff.text}</span>
                        <h3>{p.domain}</h3>
                      </div>
                      <span className={`card-badge ${p.enrolledCount >= p.maxStudents ? "badge-danger" : "badge-primary"}`}>
                        {p.enrolledCount}/{p.maxStudents} seats
                      </span>
                    </div>
                    <p className="card-desc">{p.description}</p>
                    
                    <div className="program-meta-details">
                      <div className="meta-detail-row">
                        <span className="meta-detail-label">Available seats:</span>
                        <span className="meta-detail-value">{seatsLeft} seat{seatsLeft !== 1 ? "s" : ""} free</span>
                      </div>
                      <div className="meta-detail-row">
                        <span className="meta-detail-label">Weekly Schedule:</span>
                        <div className="card-tags">
                          {p.availability && Object.entries(p.availability).map(([day, times]) => (
                            <span key={day} className="tag">📅 {day}: {times.join(", ")}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="program-card-footer">
                      <button className="btn-small" onClick={() => viewStudents(p.id)}>
                        {selectedProgram === p.id ? "Hide Students" : "View Students"}
                      </button>
                    </div>

                    {selectedProgram === p.id && (
                      <div className="students-panel animate-slide-in">
                        {loadingStudents ? <p className="muted">Loading students...</p> :
                          students.length === 0 ? <p className="muted">No students enrolled yet.</p> : (
                            <div className="student-list">
                              {students.map((s) => (
                                <div key={s.id} className="student-row">
                                  <div className="student-avatar">{s.studentName?.charAt(0)?.toUpperCase() || "?"}</div>
                                  <div className="student-info-row">
                                    <strong>{s.studentName}</strong>
                                    <span className="muted">Joined {s.enrolledDate ? new Date(s.enrolledDate).toLocaleDateString() : "—"}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Section: Sidebar widgets */}
        <div className="mentor-sidebar-column">
          
          {/* Upcoming Session Widget */}
          <div className="glass-card mentor-sidebar-card upcoming-session-card">
            <h3 className="sidebar-card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Upcoming Session
            </h3>
            <div className="upcoming-session-content">
              <div className="session-header">
                <h4>{upcomingSession.domain}</h4>
                <span className="session-status-tag">Mentor Available</span>
              </div>
              <div className="session-time-block">
                <div className="session-time-row">
                  <span className="session-time-label">Day:</span>
                  <span className="session-time-value">{upcomingSession.day}</span>
                </div>
                <div className="session-time-row">
                  <span className="session-time-label">Time:</span>
                  <span className="session-time-value">{upcomingSession.time}</span>
                </div>
              </div>
              <div className="session-action-mock">
                <button className="btn-small launch-session-btn" onClick={() => alert("Session workspace is active when scheduled.")}>
                  Launch Virtual Classroom
                </button>
              </div>
            </div>
          </div>

          {/* Learning Journey Widget */}
          <div className="glass-card mentor-sidebar-card journey-card">
            <h3 className="sidebar-card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              Learning Journey
            </h3>
            <div className="journey-timeline">
              <div className="journey-item done">
                <span className="journey-marker">✓</span>
                <span className="journey-label">Profile Created</span>
              </div>
              <div className={`journey-item ${programsCreated > 0 ? "done" : "todo"}`}>
                <span className="journey-marker">{programsCreated > 0 ? "✓" : "2"}</span>
                <span className="journey-label">Program Registered</span>
              </div>
              <div className={`journey-item ${totalStudents > 0 ? "done" : "todo"}`}>
                <span className="journey-marker">{totalStudents > 0 ? "✓" : "3"}</span>
                <span className="journey-label">Mentorship Active</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
