import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "./api/AuthContext";
// Layout
import Navbar from "./layout/Navbar";
import AdminNavBar from "./layout/AdminNavBar";
import Footer from "./layout/Footer";

// Pages
import Home from "./pages/Home";
import UserDashboard from "./pages/UserDashboard";
import QuizBank from "./pages/QuizBank";
import QuizAttempt from "./pages/QuizAttempt";
import QuizResult from "./pages/QuizResult";
import MyAttempts from "./pages/MyAttempts";
import TaskList from "./taskList/TaskList";
import UserRegister from "./users/userRegister";
import AllUserFetch from "./users/userAdm";
import UsrProfile from "./users/UsrProfile";
import AdminProfile from "./users/AdminProfile";
import EditProfile from "./users/EditAdmProfile";
import AdmReports from "./pages/AdminReports";

// Features
import CommunityChatbot from "./pages/CommunityChatbot";
import ToastProvider from "./context/toastContext";
import ProtectedRoute from "./routes/ProtectedRoute";

// Admin pages
import CreateStaff from "./users/AdminCreateUser";
import ResourceManagementPage from "./pages/ResourceManagementPage";
import CreditAwardingPage from "./pages/CreditAwardingPage";
import ReviewRatingPage from "./pages/ReviewRatingPage";
import StudySessionPage from "./pages/StudySessionPage";
import AdminResourcePage from "./pages/AdminResourcePage";
import AdminCreditPage from "./pages/AdminCreditPage";
import AdminSessionPage from "./pages/AdminSessionPage";

function App() {
  const GOOGLE_CLIENT_ID = "google client id here...";
  const { logout } = useAuth(); 
  useEffect(() => {

    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.token;
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      const timeout = decoded.exp * 1000 - Date.now();
      if (timeout <= 0) {
        logout();
        return;
      }

      const timer = setTimeout(() => {
        logout();
      }, timeout);
      return () => clearTimeout(timer);
    } catch (err) {
      logout();
    }
  }, [logout]);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ToastProvider>
        <BrowserRouter>
          <Navbar />
          <AdminNavBar />

          <Routes>
            {/* PUBLIC */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<UserRegister />} />

            {/* COMMON */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Student", "Admin", "Academic Panel"]}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />

            {/* STUDENT */}
            <Route path="/quiz-bank" element={<ProtectedRoute allowedRoles={["Student"]}><QuizBank /></ProtectedRoute>} />
            <Route path="/quiz/:id" element={<ProtectedRoute allowedRoles={["Student"]}><QuizAttempt /></ProtectedRoute>} />
            <Route path="/quiz-result" element={<ProtectedRoute allowedRoles={["Student"]}><QuizResult /></ProtectedRoute>} />
            <Route path="/my-attempts" element={<ProtectedRoute allowedRoles={["Student"]}><MyAttempts /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute allowedRoles={["Student"]}><TaskList /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allowedRoles={["Student"]}><UsrProfile /></ProtectedRoute>} />

            <Route path="/resources" element={<ProtectedRoute allowedRoles={["Student"]}><ResourceManagementPage /></ProtectedRoute>} />
            <Route path="/credits" element={<ProtectedRoute allowedRoles={["Student"]}><CreditAwardingPage /></ProtectedRoute>} />
            <Route path="/reviews" element={<ProtectedRoute allowedRoles={["Student"]}><ReviewRatingPage /></ProtectedRoute>} />
            <Route path="/sessions" element={<ProtectedRoute allowedRoles={["Student"]}><StudySessionPage /></ProtectedRoute>} />

            {/* ADMIN + ACADEMIC */}
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["Admin", "Academic Panel"]}><AllUserFetch /></ProtectedRoute>} />
            <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={["Admin", "Academic Panel"]}><AdminProfile /></ProtectedRoute>} />
            <Route path="/admin/edit-profile" element={<ProtectedRoute allowedRoles={["Admin", "Academic Panel"]}><EditProfile /></ProtectedRoute>} />
            <Route path="/admin/resources" element={<ProtectedRoute allowedRoles={["Admin", "Academic Panel"]}><AdminResourcePage /></ProtectedRoute>} />
            <Route path="/admin/sessions" element={<ProtectedRoute allowedRoles={["Admin", "Academic Panel"]}><AdminSessionPage /></ProtectedRoute>} />

            {/* ADMIN ONLY */}
            <Route path="/admin/create-staff" element={<ProtectedRoute allowedRoles={["Admin"]}><CreateStaff /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={["Admin"]}><AdmReports /></ProtectedRoute>} />
            <Route path="/admin/credits" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminCreditPage /></ProtectedRoute>} />
          </Routes>

          <CommunityChatbot />
          <Footer />
        </BrowserRouter>
      </ToastProvider>
    </GoogleOAuthProvider>
  );
}

export default App;