import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./layout/Navbar";
import ResourceManagementPage from "./pages/ResourceManagementPage";
import CreditAwardingPage from "./pages/CreditAwardingPage";
import ReviewRatingPage from "./pages/ReviewRatingPage";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/resources" replace />} />
        <Route path="/resources" element={<ResourceManagementPage />} />
        <Route path="/credits" element={<CreditAwardingPage />} />
        <Route path="/reviews" element={<ReviewRatingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;