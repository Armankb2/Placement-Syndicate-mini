import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// Attach JWT token to every request
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

// ─── User Service ───────────────────────────────────────────────

export const getMyProfile = () => api.get("/users/me");

export const getUserById = (userid) => api.get(`/users/${userid}`);

export const registerUser = (data) => api.post("/users/register", data);

// ─── Experience Service ─────────────────────────────────────────

export const getExperienceById = (userid) => api.get(`/experience/${userid}`);

export const getMyExperiences = () => api.get("/experience/me");

export const registerExperience = (data) => api.post("/experience/register", data);

export const getAllCompanies = () => api.get("/experience/companies");

export const getByCompanyName = (companyName) =>
  api.get(`/experience/company/${encodeURIComponent(companyName)}`);

export const deleteExperience = (experienceId) => api.delete(`/experience/delete/${experienceId}`);

export const deleteExperienceByAdmin = (experienceId) => api.delete(`/experience/admin/${experienceId}`);

export default api;
