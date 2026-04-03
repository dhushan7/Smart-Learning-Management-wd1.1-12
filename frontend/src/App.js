import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./layout/Navbar";
import Home from "./pages/Home";
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

function App() {
    return (
        <ToastProvider>
            <BrowserRouter>
                <Navbar />
                <AdminNavBar />

                <Routes>
                    <Route path="/" element={<Home />} />
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
                </Routes>

            </BrowserRouter>
        </ToastProvider>
    );
}

export default App;