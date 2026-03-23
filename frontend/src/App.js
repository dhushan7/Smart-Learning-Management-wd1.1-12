import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./layout/Navbar";
import Home from "./pages/Home";
import UserRegister from "./users/userRegister"

import AllUserFetch from "./users/userAdm";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/admin/users" element={<AllUserFetch />} />
        <Route path="/register" element={<UserRegister />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;