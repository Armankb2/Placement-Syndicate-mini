import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "/api",
});

function isTokenExpired(token) {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    if (!decoded || !decoded.exp) return true;
    return decoded.exp * 1000 < Date.now();
  } catch (e) {
    return true;
  }
}

// Attach JWT token to every request (legacy utility)
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

// Request interceptor: check token expiration before sending request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("placement_token");
    if (token) {
      if (isTokenExpired(token)) {
        console.warn("api: Intercepted request with expired token. Preventing request.");
        
        // Clear session and notify components
        localStorage.removeItem("placement_token");
        localStorage.removeItem("placement_user");
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));

        // Redirect to login page
        if (!window.location.pathname.endsWith("/login")) {
          window.location.href = "/login?expired=true";
        }
        
        // Cancel the request
        return Promise.reject(new axios.Cancel("Session expired. Please login again."));
      }
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 response and redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("api: Intercepted 401 response. Redirecting to login.");
      
      // Clear session
      localStorage.removeItem("placement_token");
      localStorage.removeItem("placement_user");
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      
      // Redirect
      if (!window.location.pathname.endsWith("/login")) {
        window.location.href = "/login?expired=true";
      }
    }
    return Promise.reject(error);
  }
);

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
