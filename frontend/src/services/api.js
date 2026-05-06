import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "/api",
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

export const login = (data) => api.post("/auth/login", data);

export const signup = (data) => api.post("/auth/signup", data);

// ─── Experience Service ─────────────────────────────────────────

export const getExperienceById = (userid) => api.get(`/experience/${userid}`);

export const getMyExperiences = () => api.get("/experience/me");

export const registerExperience = (data) => api.post("/experience/register", data);

export const getAllCompanies = () => api.get("/experience/companies");

export const getByCompanyName = (companyName) =>
  api.get(`/experience/company/${encodeURIComponent(companyName)}`);

export const deleteExperience = (experienceId) => api.delete(`/experience/delete/${experienceId}`);

export const deleteExperienceByAdmin = (experienceId) => api.delete(`/experience/admin/${experienceId}`);

// ─── Mentorship Service ─────────────────────────────────────────

// MENTOR
export const createProgram = (data) => api.post("/mentorship/programs", data);
export const getMyPrograms = () => api.get("/mentorship/programs/me");
export const getEnrolledStudents = (programId) => api.get(`/mentorship/programs/${programId}/students`);

// STUDENT
export const getAllPrograms = () => api.get("/mentorship/programs");
export const enrollInProgram = (programId) => api.post(`/mentorship/programs/${programId}/enroll`);
export const getMyEnrollments = () => api.get("/mentorship/enrollments/me");

export default api;
