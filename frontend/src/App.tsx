import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthContext, useProvideAuth } from "./hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import JobDetails from "./pages/JobDetails";
import Login from "./pages/Login";
import ResumeUploadPage from "./pages/ResumeUploadPage";
import SavedJobs from "./pages/SavedJobs";
import Settings from "./pages/Settings";
import Signup from "./pages/Signup";

export default function App() {
  const auth = useProvideAuth();

  return (
    <AuthContext.Provider value={auth}>
      <div className="min-h-screen bg-[#f4f7f9]">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><ResumeUploadPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/saved" element={<ProtectedRoute><SavedJobs /></ProtectedRoute>} />
          <Route path="/jobs/:matchId" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthContext.Provider>
  );
}
