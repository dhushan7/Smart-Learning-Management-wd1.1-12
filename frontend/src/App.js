import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./layout/Navbar";
import ResourceManagementPage from "./pages/ResourceManagementPage";
import CreditAwardingPage from "./pages/CreditAwardingPage";
import ReviewRatingPage from "./pages/ReviewRatingPage";
import StudySessionPage from "./pages/StudySessionPage";
import AdminResourcePage from "./pages/AdminResourcePage";
import AdminCreditPage from "./pages/AdminCreditPage";
import AdminSessionPage from "./pages/AdminSessionPage";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/resources" replace />} />

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
    </BrowserRouter>
  );
}

export default App;