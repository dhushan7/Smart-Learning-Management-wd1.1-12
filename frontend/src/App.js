import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./layout/Navbar";
import Home from "./pages/Home";
import QuizBank from "./pages/QuizBank";
import QuizAttempt from "./pages/QuizAttempt";
import QuizResult from "./pages/QuizResult";
import CommunityChatbot from "./pages/CommunityChatbot";
import UserRegister from "./users/userRegister";
import TaskList from "./taskList/TaskList";
import UserDashboard from "./pages/UserDashboard";
import AllUserFetch from "./users/userAdm";
import ToastProvider from "./context/toastContext";
import CreateStaff from "./users/AdminCreateUser";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminNavBar from "./layout/AdminNavBar";
import UsrProfile from "./users/UsrProfile";
import AdminProfile from "./users/AdminProfile";
import EditProfile from "./users/EditAdmProfile";
import AdmReports from "./pages/AdminReports";
import MyAttempts from "./pages/MyAttempts";

import ResourceManagementPage from "./pages/ResourceManagementPage";
import CreditAwardingPage from "./pages/CreditAwardingPage";
import ReviewRatingPage from "./pages/ReviewRatingPage";
import StudySessionPage from "./pages/StudySessionPage";
import AdminResourcePage from "./pages/AdminResourcePage";
import AdminCreditPage from "./pages/AdminCreditPage";
import AdminSessionPage from "./pages/AdminSessionPage";

function App() {

    const role = localStorage.getItem("role");
    
    const isStudent = role === "Student";
    const isAdmin = role === "Admin" || role === "Academic Panel";

    return (
        <ToastProvider>
            <BrowserRouter>
                <Navbar />
                <AdminNavBar />

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/quiz-bank" element={<QuizBank />} />
                    <Route path="/quiz/:id" element={<QuizAttempt />} />
                    <Route path="/quiz-result" element={<QuizResult />} />
                    <Route path="/my-attempts" element={<MyAttempts />} />
      
                    
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                            <UserDashboard />
                            </ProtectedRoute>
                        }
                        />
                    <Route path="/admin/users" element={<AllUserFetch />} />
                    <Route path="/register" element={<UserRegister />} />
                    <Route path="/admin/create-staff" element={<CreateStaff />} />
                    <Route path="/tasks" element={<TaskList />} />
                    <Route path="/profile" element={<UsrProfile />} />
                    <Route path="/admin/profile" element={<AdminProfile />} />
                    <Route path="/admin/edit-profile" element={<EditProfile />} />
                    <Route path="/admin/reports" element={<AdmReports />} />


                    {/* Student routes */}
                    <Route path="/resources" element={<ResourceManagementPage />} />
                    <Route path="/credits"   element={<CreditAwardingPage />} />
                    <Route path="/reviews"   element={<ReviewRatingPage />} />
                    <Route path="/sessions"  element={<StudySessionPage />} />

                    {/* Admin routes */}
                    <Route path="/admin/resources" element={<AdminResourcePage />} />
                    <Route path="/admin/credits"   element={<AdminCreditPage />} />
                    <Route path="/admin/sessions"  element={<AdminSessionPage />} />


                </Routes>
                    
                {isStudent && <CommunityChatbot />}
            </BrowserRouter>
        </ToastProvider>
    );
}

export default App;