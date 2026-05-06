import { useState } from "react";
import { uploadResume, getResumeFeedback } from "../services/resumeApi";
import { useAuth } from "../context/AuthContext";
import { getShortName } from "../utils/displayName";
import "./ResumeUploadPage.css";

const ResumeUploadPage = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState(null);
  const { user } = useAuth();
  const displayName = getShortName(user, "User");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus("idle");
      setMessage("");
      setFeedback(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    setStatus("uploading");
    setFeedback(null);

    try {
      await uploadResume(file);
      setStatus("processing");
      setMessage("Upload successful. AI is now analyzing your resume...");
      startPolling(file.name);
    } catch (error) {
      setStatus("error");
      setMessage(error.response?.data?.detail || "Failed to upload resume.");
    }
  };

  const startPolling = (filename) => {
    let attempts = 0;
    const maxAttempts = 30;

    const poll = async () => {
      attempts++;
      if (attempts > maxAttempts) {
        setStatus("error");
        setMessage("AI processing is taking longer than expected. Please check back later.");
        return;
      }

      try {
        const response = await getResumeFeedback(filename);
        if (response.data) {
          setFeedback(response.data);
          setStatus("completed");
          setMessage("AI analysis complete.");
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error("Polling error:", error);
        }
        setTimeout(poll, 2000);
      }
    };

    poll();
  };

  return (
    <div className="container animate-up">
      <div className={`resume-workspace ${feedback ? "with-feedback" : ""}`}>
        <section className="glass-card upload-section">
          <span className="form-step">AI Resume Advisor</span>
          <h1 className="title">Upload your resume</h1>
          <p className="subtitle">
            Hello <strong>{displayName}</strong>, get role-aware feedback from the interview library.
          </p>

          <form onSubmit={handleSubmit} className="upload-form">
            <div className={`drop-zone ${file ? "has-file" : ""}`}>
              <input
                type="file"
                id="resume-input"
                onChange={handleFileChange}
                accept=".pdf,.docx"
                className="file-input"
                disabled={status === "uploading" || status === "processing"}
              />
              <label htmlFor="resume-input" className="file-label">
                <span className="file-symbol">CV</span>
                {file ? (
                  <span className="file-name">{file.name}</span>
                ) : (
                  <span className="placeholder">Choose a PDF or DOCX file</span>
                )}
              </label>
            </div>

            <button
              type="submit"
              className={`upload-button ${status === "uploading" || status === "processing" ? "loading" : ""}`}
              disabled={status === "uploading" || status === "processing" || !file}
            >
              {status === "uploading" ? "Uploading..." :
                status === "processing" ? "Analyzing..." : "Upload resume"}
            </button>
          </form>

          {message && (
            <div className={`status-message ${status}`}>
              {message}
            </div>
          )}
        </section>

        {feedback && (
          <section className="glass-card feedback-section animate-slide-in">
            <h2 className="feedback-title">AI advisor feedback</h2>
            <div className="feedback-scroll-area">
              {feedback.advice.split("\n").map((line, i) => {
                if (line.startsWith("###")) {
                  return <h3 key={i} className="feedback-header">{line.replace("###", "").trim()}</h3>;
                }
                if (line.startsWith("- ")) {
                  return <li key={i} className="feedback-list-item">{line.replace("- ", "").trim()}</li>;
                }
                if (line.startsWith("  - ")) {
                  return <li key={i} className="feedback-list-item sub">{line.replace("  - ", "").trim()}</li>;
                }
                return line.trim() ? <p key={i} className="feedback-text">{line}</p> : <br key={i} />;
              })}
            </div>
            <div className="matches-grid">
              {feedback.matches.map((match, i) => (
                <div key={i} className="match-tag">
                  {match.company} / Match {Math.round(match.score)}%
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ResumeUploadPage;
