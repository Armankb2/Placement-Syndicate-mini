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
  const { hasRole } = useAuth();

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
        const similar = res.data.similar || [];
        setSimilarCompanies(similar);
        if (similar.length === 0) {
          setSimilarError("No similar companies found yet. Add more experiences to improve suggestions.");
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
      const deletePromise = hasRole("ADMIN")
        ? deleteExperienceByAdmin(experienceId)
        : deleteExperience(experienceId);

      deletePromise
        .then(() => {
          setExperiences(experiences.filter((exp) => exp.id !== experienceId));
        })
        .catch((err) => setError(err.response?.data?.message || err.message));
    }
  };

  const filteredCompanies = companies.filter((company) =>
    company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container animate-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Interview <span>Experiences</span>
          </h1>
          <p className="page-subtitle">Search companies, read rounds, and compare interview patterns.</p>
        </div>
      </div>

      <div className="experience-layout">
        <aside className="company-sidebar glass">
          <div className="sidebar-heading">
            <h3>Companies</h3>
            <span>{filteredCompanies.length}</span>
          </div>
          <input
            type="text"
            placeholder="Search company"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-box"
          />
          <div className="company-list">
            {filteredCompanies.map((company) => (
              <button
                key={company}
                className={`company-pill ${selectedCompany === company ? "active" : ""}`}
                onClick={() => handleCompanySelect(company)}
              >
                {company}
              </button>
            ))}
          </div>
        </aside>

        <main className="experience-main">
          {!selectedCompany ? (
            <div className="empty-state glass">
              <span className="icon">CO</span>
              <p>Select a company to browse interview experiences.</p>
            </div>
          ) : (
            <div className="experience-results">
              <div className="results-header">
                <div>
                  <span className="eyebrow">Selected company</span>
                  <h2>
                    {selectedCompany} <span className="exp-count">{experiences.length} reports</span>
                  </h2>
                </div>
                <button
                  id="similar-companies-btn"
                  className="similar-btn"
                  onClick={handleFindSimilar}
                  disabled={similarLoading}
                  title="Find companies with similar interview patterns"
                >
                  {similarLoading ? "Finding matches" : "Similar companies"}
                </button>
              </div>

              {loading && <div className="loader inline-loader">Analyzing data...</div>}
              {error && <p className="error-message inline-error">{error}</p>}

              {(similarLoading || similarCompanies.length > 0 || similarError) && (
                <div className="similar-panel glass animate-slide-in">
                  <div className="similar-panel-header">
                    <span className="similar-icon">AI</span>
                    <h3>Companies with similar interview patterns</h3>
                    <button
                      className="similar-close-btn"
                      onClick={() => {
                        setSimilarCompanies([]);
                        setSimilarError(null);
                      }}
                    >
                      Close
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
                      {similarCompanies.map((similar, index) => (
                        <button
                          key={similar.companyName || index}
                          className="similar-card"
                          onClick={() => handleCompanySelect(similar.companyName)}
                          title={`Click to view ${similar.companyName} experiences`}
                        >
                          <div className="similar-card-rank">#{index + 1}</div>
                          <div className="similar-card-body">
                            <div className="similar-company-name">{similar.companyName}</div>
                            <div className="similar-scores">
                              <span className="score-badge total">
                                {Math.round(similar.similarityScore * 100)}% match
                              </span>
                              <span className="score-badge semantic">
                                Semantic {Math.round(similar.semanticScore * 100)}%
                              </span>
                              <span className="score-badge keyword">
                                Keyword {Math.round(similar.keywordScore * 100)}%
                              </span>
                            </div>
                          </div>
                          <div className="similar-arrow">View</div>
                        </button>
                      ))}
                    </div>
                  )}

                  <p className="similar-footnote">
                    Similarity combines semantic and keyword matching across interview questions and tips.
                  </p>
                </div>
              )}

              <div className="experience-grid">
                {experiences.map((exp) => (
                  <div key={exp.id} className="experience-card glass glass-hover">
                    <div className="card-header">
                      <div>
                        <h3>{exp.role}</h3>
                        <p className="meta-info">Year {exp.year} / By {exp.createdBy}</p>
                      </div>
                      <span className={`difficulty-badge ${exp.difficultyLevel?.toLowerCase()}`}>
                        {exp.difficultyLevel}
                      </span>
                    </div>

                    <div className="card-body">
                      <div className="content-section">
                        <h4>Questions</h4>
                        <p>{exp.quetions || "No questions documented."}</p>
                      </div>

                      <div className="content-section">
                        <h4>Top tips</h4>
                        <p>{exp.tips || "No tips documented."}</p>
                      </div>

                      {exp.rounds && exp.rounds.length > 0 && (
                        <div className="rounds-section">
                          <h4>Interview rounds</h4>
                          <div className="round-list">
                            {exp.rounds.map((round, index) => (
                              <article className="round-detail" key={`${round.roundName || "round"}-${index}`}>
                                <div className="round-number">{index + 1}</div>
                                <div className="round-copy">
                                  <h5>{round.roundName || `Round ${index + 1}`}</h5>
                                  <p>{round.description || "No round description documented."}</p>
                                </div>
                              </article>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {hasRole("ADMIN") && (
                      <div className="card-footer">
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(exp.id)}
                        >
                          Delete as admin
                        </button>
                      </div>
                    )}
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
