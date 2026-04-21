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

import Footer from "./layout/Footer";

function App() {
    return (
        <ToastProvider>
            <BrowserRouter>
                <Navbar />
                <AdminNavBar />

                <Routes>
                    {/* PUBLIC ROUTES (Anyone can see these)*/}
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<UserRegister />} />
      
                    {/* SHARED LOGGED-IN ROUTES */}
                    <Route 
                        path="/dashboard" 
                        element={
                            <ProtectedRoute allowedRoles={["Student", "Admin", "Academic Panel"]}>
                                <UserDashboard />
                            </ProtectedRoute>
                        } 
                    />

                    {/* STUDENT ONLY ROUTES */}
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


                    {/* ADMIN & ACADEMIC PANEL SHARED ROUTES */}
                    <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["Admin", "Academic Panel"]}><AllUserFetch /></ProtectedRoute>} />
                    <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={["Admin", "Academic Panel"]}><AdminProfile /></ProtectedRoute>} />
                    <Route path="/admin/edit-profile" element={<ProtectedRoute allowedRoles={["Admin", "Academic Panel"]}><EditProfile /></ProtectedRoute>} />
                    <Route path="/admin/resources" element={<ProtectedRoute allowedRoles={["Admin", "Academic Panel"]}><AdminResourcePage /></ProtectedRoute>} />
                    <Route path="/admin/sessions" element={<ProtectedRoute allowedRoles={["Admin", "Academic Panel"]}><AdminSessionPage /></ProtectedRoute>} />


                    {/* STRICTLY ADMIN ONLY ROUTES */}
                    <Route path="/admin/create-staff" element={<ProtectedRoute allowedRoles={["Admin"]}><CreateStaff /></ProtectedRoute>} />
                    <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={["Admin"]}><AdmReports /></ProtectedRoute>} />
                    <Route path="/admin/credits" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminCreditPage /></ProtectedRoute>} />

                </Routes>
                    
                <CommunityChatbot />
                <Footer />
            </BrowserRouter>
        </ToastProvider>
    );
}

export default App;