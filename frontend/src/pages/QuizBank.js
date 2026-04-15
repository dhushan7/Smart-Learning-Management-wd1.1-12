import { useNavigate } from "react-router-dom";
import quizzes from "../data/quizzes";
import "../App.css";

function QuizBank() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <h1 className="page-title">Learning Material Quizzes</h1>
      <p className="page-subtitle">
        Test your knowledge after watching a video or reading lecture notes.
      </p>

      <div className="quiz-grid">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="quiz-card">
            <h2>{quiz.title}</h2>
            <p><strong>Subject:</strong> {quiz.subject}</p>
            <p><strong>Material:</strong> {quiz.videoTitle}</p>

            <button
                className="quiz-button"
                onClick={() => navigate(`/quiz/${quiz.id}`)}
            >
            Take Quiz
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuizBank;