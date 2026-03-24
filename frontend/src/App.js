import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./layout/Navbar";
import Home from "./pages/Home";
import QuizBank from "./pages/QuizBank";
import QuizAttempt from "./pages/QuizAttempt";
import QuizResult from "./pages/QuizResult";
import CommunityChatbot from "./pages/CommunityChatbot";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quiz-bank" element={<QuizBank />} />
        <Route path="/quiz/:id" element={<QuizAttempt />} />
        <Route path="/quiz-result" element={<QuizResult />} />
        <Route path="/chatbot" element={<CommunityChatbot />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;