import { useEffect, useState } from "react";
import {
  getAllCompanies,
  getByCompanyName,
  deleteExperience,
  deleteExperienceByAdmin,
} from "../services/api";
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

  useEffect(() => {
    getAllCompanies()
      .then((res) => setCompanies(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message));
  }, []);

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    setLoading(true);
    setError(null);
    getByCompanyName(company)
      .then((res) => setExperiences(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
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

  const filteredCompanies = companies.filter(c => 
    c.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container animate-up">
      <div className="page-header">
        <h1 className="page-title">Interview <span>Experiences</span></h1>
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
              <h2>Top {selectedCompany} Experiences</h2>
              {loading && <div className="loader">Analyzing data...</div>}
              {error && <p className="error-message">{error}</p>}
              
              <div className="experience-grid">
                {experiences.map((exp) => (
                  <div key={exp.id} className="experience-card glass glass-hover">
                    <div className="card-header">
                      <h3>{exp.role}</h3>
                      <span className={`difficulty-badge ${exp.difficultyLevel.toLowerCase()}`}>
                        {exp.difficultyLevel}
                      </span>
                    </div>
                    
                    <div className="card-body">
                      <p className="meta-info">Year: {exp.year} | By: {exp.createdBy}</p>
                      
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
                      {hasRole('Admin') && (
                        <button className="delete-btn" onClick={() => handleDelete(exp.id)}>Delete (Admin)</button>
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
