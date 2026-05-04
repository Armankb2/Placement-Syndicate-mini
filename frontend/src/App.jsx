import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { setAuthToken } from "./services/api";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import ExperienceListPage from "./pages/ExperienceListPage";
import AddExperiencePage from "./pages/AddExperiencePage";
import AdminPage from "./pages/AdminPage";
import ResumeUploadPage from "./pages/ResumeUploadPage";
import MyExperiencesPage from "./pages/MyExperiencesPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MentorDashboard from "./pages/MentorDashboard";
import BrowsePrograms from "./pages/BrowsePrograms";
import MyEnrollments from "./pages/MyEnrollments";

/**
 * Component to handle conditional Navbar rendering
 */
function NavigationWrapper() {
  const location = useLocation();
  const hideNavbarRoutes = ["/login", "/signup"];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return !shouldHideNavbar ? <Navbar /> : null;
}

export default function App() {
  const { token } = useAuth();

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  return (
    <BrowserRouter>
      <NavigationWrapper />
      <main className="app-shell">
        <Routes>
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/my-experiences" element={<ProtectedRoute><MyExperiencesPage /></ProtectedRoute>} />
          <Route path="/experiences" element={<ProtectedRoute><ExperienceListPage /></ProtectedRoute>} />
          <Route path="/experiences/new" element={<ProtectedRoute><AddExperiencePage /></ProtectedRoute>} />
          <Route path="/upload-resume" element={<ProtectedRoute><ResumeUploadPage /></ProtectedRoute>} />
          {/* Mentorship Routes */}
          <Route path="/mentor-dashboard" element={<ProtectedRoute><MentorDashboard /></ProtectedRoute>} />
          <Route path="/programs" element={<ProtectedRoute><BrowsePrograms /></ProtectedRoute>} />
          <Route path="/my-enrollments" element={<ProtectedRoute><MyEnrollments /></ProtectedRoute>} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="Admin">
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
