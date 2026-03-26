import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./layout/Navbar";
import Home from "./pages/Home";
import UserRegister from "./users/userRegister"
import TaskList from "./taskList/TaskList"
import UserDashboard from "./pages/UserDashboard";

import AllUserFetch from "./users/userAdm";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route exact path="/admin/users" element={<AllUserFetch />} />
        <Route path="/register" element={<UserRegister />} />
        <Route path="/tasks" element={<TaskList />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;