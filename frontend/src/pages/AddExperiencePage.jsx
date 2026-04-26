import { useState } from "react";
import { registerExperience } from "../services/api";
import { useNavigate } from "react-router-dom";
import "./AddExperiencePage.css";

export default function AddExperiencePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: "",
    role: "",
    year: new Date().getFullYear(),
    quetions: "",
    tips: "",
    difficultyLevel: "MEDIUM",
    rounds: [{ roundName: "", description: "" }],
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoundChange = (index, field, value) => {
    const updated = [...form.rounds];
    updated[index][field] = value;
    setForm({ ...form, rounds: updated });
  };

  const addRound = () => {
    setForm({ ...form, rounds: [...form.rounds, { roundName: "", description: "" }] });
  };

  const removeRound = (index) => {
    const updated = form.rounds.filter((_, i) => i !== index);
    setForm({ ...form, rounds: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    registerExperience({
      ...form,
      year: parseInt(form.year, 10),
    })
      .then(() => navigate("/experiences"))
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="container animate-up">
      <div className="form-container glass">
        <h2 className="form-title">Share Your <span>Journey</span></h2>
        <p className="form-subtitle">Help others by documenting your interview experience.</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="entry-form">
          <div className="form-grid">
            <div className="input-group">
              <label>Company Name</label>
              <input name="companyName" placeholder="e.g. Google" value={form.companyName} onChange={handleChange} required />
            </div>
            
            <div className="input-group">
              <label>Role</label>
              <input name="role" placeholder="e.g. SDE-1" value={form.role} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label>Year</label>
              <input name="year" type="number" value={form.year} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label>Difficulty</label>
              <select name="difficultyLevel" value={form.difficultyLevel} onChange={handleChange}>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Interview Questions</label>
            <textarea name="quetions" placeholder="List the questions they asked..." value={form.quetions} onChange={handleChange} rows={4} />
          </div>

          <div className="input-group">
            <label>Tips for Candidates</label>
            <textarea name="tips" placeholder="What should others prepare for?" value={form.tips} onChange={handleChange} rows={3} />
          </div>

          <div className="rounds-container">
            <div className="section-header">
              <h3>Interview Rounds</h3>
              <button type="button" className="btn-small" onClick={addRound}>+ Add Round</button>
            </div>
            
            {form.rounds.map((round, i) => (
              <div key={i} className="round-item glass">
                <div className="round-header">
                  <input
                    placeholder="Round Name (e.g. Coding)"
                    value={round.roundName}
                    onChange={(e) => handleRoundChange(i, "roundName", e.target.value)}
                    required
                  />
                  {form.rounds.length > 1 && (
                    <button type="button" className="remove-btn" onClick={() => removeRound(i)}>×</button>
                  )}
                </div>
                <textarea
                  placeholder="What happened in this round?"
                  value={round.description}
                  onChange={(e) => handleRoundChange(i, "description", e.target.value)}
                  rows={2}
                />
              </div>
            ))}
          </div>

          <button type="submit" className="btn-primary full-width" disabled={submitting}>
            {submitting ? "Submitting..." : "Publish Experience"}
          </button>
        </form>
      </div>
    </div>
  );
}
