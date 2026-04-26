import { useEffect, useState } from "react";
import { getMyExperiences, deleteExperience } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./MyExperiencesPage.css";

const MyExperiencesPage = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchMyExperiences();
  }, []);

  const fetchMyExperiences = async () => {
    try {
      setLoading(true);
      const response = await getMyExperiences();
      setExperiences(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load your experiences.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this experience?")) {
      try {
        await deleteExperience(id);
        setExperiences(experiences.filter((exp) => exp.id !== id));
      } catch (err) {
        alert("Failed to delete experience: " + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="container animate-up">
      <div className="page-header">
        <h1 className="page-title">My <span>Contributions</span></h1>
        <p className="page-subtitle">Manage the interview experiences you've shared with the community.</p>
      </div>

      {loading ? (
        <div className="loader">Fetching your records...</div>
      ) : error ? (
        <div className="error-card glass">
          <span className="icon">⚠️</span>
          <p>{error}</p>
          <button onClick={fetchMyExperiences} className="btn-small">Retry</button>
        </div>
      ) : experiences.length === 0 ? (
        <div className="empty-state glass">
          <span className="icon">📝</span>
          <p>You haven't shared any experiences yet.</p>
          <button onClick={() => window.location.href='/experiences/new'} className="btn-primary">Share Your First Experience</button>
        </div>
      ) : (
        <div className="experience-grid">
          {experiences.map((exp) => (
            <div key={exp.id} className="experience-card glass glass-hover">
              <div className="card-header">
                <div>
                  <h3>{exp.role}</h3>
                  <p className="company-info">{exp.companyName}</p>
                </div>
                <span className={`difficulty-badge ${exp.difficultyLevel?.toLowerCase()}`}>
                  {exp.difficultyLevel}
                </span>
              </div>
              
              <div className="card-body">
                <p className="meta-info">Year: {exp.year} | Shared on: {new Date(exp.createdDate).toLocaleDateString()}</p>
                
                <div className="content-section">
                  <h4>Questions Shared</h4>
                  <p className="truncate-text">{exp.quetions || "No questions documented."}</p>
                </div>
              </div>

              <div className="card-footer">
                <button className="delete-btn" onClick={() => handleDelete(exp.id)}>Delete Experience</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyExperiencesPage;
