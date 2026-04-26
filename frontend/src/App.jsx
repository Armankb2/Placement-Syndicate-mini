import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

export default function App() {
  const { token } = useAuth();

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ padding: "0 20px" }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-experiences" element={<MyExperiencesPage />} />
          <Route path="/experiences" element={<ExperienceListPage />} />
          <Route path="/experiences/new" element={<AddExperiencePage />} />
          <Route path="/upload-resume" element={<ResumeUploadPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="Admin">
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
