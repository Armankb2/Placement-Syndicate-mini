import axios from "axios";

// In production, this will be your Koyeb/Render URL for the Python service
const RESUME_API_URL = import.meta.env.VITE_RESUME_API_URL || "http://localhost:8050";

const resumeApi = axios.create({
  baseURL: RESUME_API_URL + "/api/resume",
});

export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return resumeApi.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getResumeFeedback = (filename) => {
  return resumeApi.get(`/feedback/${encodeURIComponent(filename)}`);
};

export const getSimilarCompanies = (companyName, limit = 3) => {
  return resumeApi.get(`/similar/${encodeURIComponent(companyName)}?limit=${limit}`);
};

export default resumeApi;
