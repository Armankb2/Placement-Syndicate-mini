import { useEffect, useState } from "react";
import {
  getAllCompanies,
  getByCompanyName,
  deleteExperience,
  deleteExperienceByAdmin,
} from "../services/api";
import { getSimilarCompanies } from "../services/resumeService";
import { useAuth } from "../context/AuthContext";
import "./ExperienceListPage.css";

export default function ExperienceListPage() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { user, hasRole } = useAuth();

  // Similar companies state
  const [similarCompanies, setSimilarCompanies] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarError, setSimilarError] = useState(null);

  useEffect(() => {
    getAllCompanies()
      .then((res) => setCompanies(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message));
  }, []);

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    setLoading(true);
    setError(null);
    // Reset similar companies when switching company
    setSimilarCompanies([]);
    setSimilarError(null);

    getByCompanyName(company)
      .then((res) => setExperiences(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  };

  const handleFindSimilar = () => {
    if (!selectedCompany) return;
    setSimilarLoading(true);
    setSimilarError(null);
    setSimilarCompanies([]);

    getSimilarCompanies(selectedCompany, 3)
      .then((res) => {
        setSimilarCompanies(res.data.similar || []);
        if ((res.data.similar || []).length === 0) {
          setSimilarError("No similar companies found yet. Add more experiences to improve suggestions!");
        }
      })
      .catch((err) => {
        const msg = err.response?.data?.detail || err.message;
        setSimilarError(`Could not load suggestions: ${msg}`);
      })
      .finally(() => setSimilarLoading(false));
  };

  const handleDelete = (experienceId) => {
    if (window.confirm("Are you sure you want to delete this experience?")) {
      const deletePromise = hasRole("Admin")
        ? deleteExperienceByAdmin(experienceId)
        : deleteExperience(experienceId);

      deletePromise
        .then(() => {
          setExperiences(experiences.filter((exp) => exp.id !== experienceId));
        })
        .catch((err) => setError(err.response?.data?.message || err.message));
    }
  };

  const filteredCompanies = companies.filter((c) =>
    c.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container animate-up">
      <div className="page-header">
        <h1 className="page-title">
          Interview <span>Experiences</span>
        </h1>
      </div>

      <div className="experience-layout">
        <aside className="company-sidebar glass">
          <h3>Companies</h3>
          <input
            type="text"
            placeholder="Search company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-box"
          />
          <div className="company-list">
            {filteredCompanies.map((c) => (
              <button
                key={c}
                className={`company-pill ${selectedCompany === c ? "active" : ""}`}
                onClick={() => handleCompanySelect(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </aside>

        <main className="experience-main">
          {!selectedCompany ? (
            <div className="empty-state glass">
              <span className="icon">🏛️</span>
              <p>Select a company to browse interview experiences.</p>
            </div>
          ) : (
            <div className="experience-results">
              <div className="results-header">
                <h2>
                  {selectedCompany} <span className="exp-count">({experiences.length})</span>
                </h2>
                <button
                  id="similar-companies-btn"
                  className="similar-btn"
                  onClick={handleFindSimilar}
                  disabled={similarLoading}
                  title="Find companies with similar interview patterns"
                >
                  {similarLoading ? (
                    <span>🔍 Finding...</span>
                  ) : (
                    <span>✨ Similar Companies</span>
                  )}
                </button>
              </div>

              {loading && <div className="loader">Analyzing data...</div>}
              {error && <p className="error-message">{error}</p>}

              {/* ─── Similar Companies Panel ─────────────────────────── */}
              {(similarLoading || similarCompanies.length > 0 || similarError) && (
                <div className="similar-panel glass animate-slide-in">
                  <div className="similar-panel-header">
                    <span className="similar-icon">🔗</span>
                    <h3>Companies with Similar Interview Patterns</h3>
                    <button
                      className="similar-close-btn"
                      onClick={() => {
                        setSimilarCompanies([]);
                        setSimilarError(null);
                      }}
                    >
                      ×
                    </button>
                  </div>

                  {similarLoading && (
                    <div className="similar-loading">
                      <div className="similar-spinner" />
                      <span>AI is analyzing interview patterns...</span>
                    </div>
                  )}

                  {similarError && !similarLoading && (
                    <p className="similar-error">{similarError}</p>
                  )}

                  {!similarLoading && similarCompanies.length > 0 && (
                    <div className="similar-grid">
                      {similarCompanies.map((s, i) => (
                        <button
                          key={i}
                          className="similar-card"
                          onClick={() => handleCompanySelect(s.companyName)}
                          title={`Click to view ${s.companyName} experiences`}
                        >
                          <div className="similar-card-rank">#{i + 1}</div>
                          <div className="similar-card-body">
                            <div className="similar-company-name">{s.companyName}</div>
                            <div className="similar-scores">
                              <span className="score-badge total">
                                {Math.round(s.similarityScore * 100)}% match
                              </span>
                              <span className="score-badge semantic">
                                🧠 {Math.round(s.semanticScore * 100)}%
                              </span>
                              <span className="score-badge keyword">
                                🔤 {Math.round(s.keywordScore * 100)}%
                              </span>
                            </div>
                          </div>
                          <div className="similar-arrow">→</div>
                        </button>
                      ))}
                    </div>
                  )}

                  <p className="similar-footnote">
                    Similarity is computed using AI (semantic + keyword matching) on interview questions and tips.
                  </p>
                </div>
              )}

              {/* ─── Experience Cards ─────────────────────────────────── */}
              <div className="experience-grid">
                {experiences.map((exp) => (
                  <div key={exp.id} className="experience-card glass glass-hover">
                    <div className="card-header">
                      <h3>{exp.role}</h3>
                      <span className={`difficulty-badge ${exp.difficultyLevel?.toLowerCase()}`}>
                        {exp.difficultyLevel}
                      </span>
                    </div>

                    <div className="card-body">
                      <p className="meta-info">
                        Year: {exp.year} | By: {exp.createdBy}
                      </p>

                      <div className="content-section">
                        <h4>Questions</h4>
                        <p>{exp.quetions}</p>
                      </div>

                      <div className="content-section">
                        <h4>Top Tips</h4>
                        <p>{exp.tips}</p>
                      </div>

                      {exp.rounds && exp.rounds.length > 0 && (
                        <div className="rounds-summary">
                          <h4>{exp.rounds.length} Rounds Covered</h4>
                        </div>
                      )}
                    </div>

                    <div className="card-footer">
                      {hasRole("Admin") && (
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(exp.id)}
                        >
                          Delete (Admin)
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
