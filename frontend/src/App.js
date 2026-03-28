import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./layout/Navbar";
import Home from "./pages/Home";
import UserRegister from "./users/userRegister";
import TaskList from "./taskList/TaskList";
import UserDashboard from "./pages/UserDashboard";
import AllUserFetch from "./users/userAdm";
import ToastProvider from "./context/toastContext";
import CreateStaff from "./users/AdminCreateUser"

function App() {
    return (
        <ToastProvider>
            <BrowserRouter>
                <Navbar />

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard" element={<UserDashboard />} />
                    <Route path="/admin/users" element={<AllUserFetch />} />
                    <Route path="/register" element={<UserRegister />} />
                    <Route path="/admin/create-staff" element={<CreateStaff />} />
                    <Route path="/tasks" element={<TaskList />} />
                </Routes>

            </BrowserRouter>
        </ToastProvider>
    );
}

export default App;