import { useState, useEffect } from "react";
import { uploadResume, getResumeFeedback } from "../services/resumeService";
import { useAuth } from "../context/AuthContext";
import "./ResumeUploadPage.css";

const ResumeUploadPage = () => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState("idle"); // idle, uploading, success, processing, completed, error
    const [message, setMessage] = useState("");
    const [feedback, setFeedback] = useState(null);
    const { user } = useAuth();
    let pollInterval = null;

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
            const response = await uploadResume(file);
            setStatus("processing");
            setMessage("Upload successful! AI is now analyzing your resume...");
            
            // Start polling for feedback
            startPolling(file.name);
        } catch (error) {
            setStatus("error");
            setMessage(error.response?.data?.detail || "Failed to upload resume.");
        }
    };

    const startPolling = (filename) => {
        let attempts = 0;
        const maxAttempts = 30; // 60 seconds (2s x 30)

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
                    setMessage("AI analysis complete!");
                }
            } catch (error) {
                // Ignore 404s and 500s during polling
                if (error.response?.status !== 404) {
                    console.error("Polling error:", error);
                }
                // Continue polling
                setTimeout(poll, 2000);
            }
        };

        poll();
    };

    return (
        <div className="resume-upload-container">
            <div className={`main-content ${feedback ? "with-feedback" : ""}`}>
                <div className="glass-card upload-section">
                    <h1 className="title">Upload Your Resume</h1>
                    <p className="subtitle">
                        Hello <strong>{user?.name || "User"}</strong>, let's get you noticed!
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
                                <span className="icon">📄</span>
                                {file ? (
                                    <span className="file-name">{file.name}</span>
                                ) : (
                                    <span className="placeholder">Choose a file (PDF/DOCX)</span>
                                )}
                            </label>
                        </div>

                        <button
                            type="submit"
                            className={`upload-button ${status === "uploading" || status === "processing" ? "loading" : ""}`}
                            disabled={status === "uploading" || status === "processing" || !file}
                        >
                            {status === "uploading" ? "Uploading..." : 
                             status === "processing" ? "Analyzing..." : "Upload Resume"}
                        </button>
                    </form>

                    {message && (
                        <div className={`status-message ${status}`}>
                            {status === "completed" ? "✅" : 
                             status === "processing" ? "🔄" : "❌"} {message}
                        </div>
                    )}
                </div>

                {feedback && (
                    <div className="glass-card feedback-section animate-slide-in">
                        <h2 className="feedback-title">🚀 AI Advisor Feedback</h2>
                        <div className="feedback-scroll-area">
                            {feedback.advice.split('\n').map((line, i) => (
                                <p key={i} className={line.startsWith('###') ? 'feedback-header' : 'feedback-text'}>
                                    {line.replace('###', '')}
                                </p>
                            ))}
                        </div>
                        <div className="matches-grid">
                            {feedback.matches.map((match, i) => (
                                <div key={i} className="match-tag">
                                    {match.company} (Match: {Math.round(match.score * 100)}%)
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeUploadPage;
