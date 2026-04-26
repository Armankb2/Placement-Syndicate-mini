import api from "./api";

/**
 * Uploads a resume file to the backend via the API Gateway.
 * @param {File} file - The resume file to upload.
 * @returns {Promise} - The response from the server.
 */
export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post("/resume/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * Fetches AI feedback for a specific resume from the backend.
 * @param {string} filename - The name of the resume file.
 * @returns {Promise} - The feedback from the NLP engine.
 */
export const getResumeFeedback = (filename) => {
  return api.get(`/resume/feedback/${encodeURIComponent(filename)}`);
};
