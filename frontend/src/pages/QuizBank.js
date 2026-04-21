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
          <div key={quiz.id} className="quiz-card quiz-card-hover">
            <div className="quiz-card-header">
              <h2>{quiz.title}</h2>
            </div>
            <div className="quiz-card-body">
              <p><strong>Subject:</strong> {quiz.subject}</p>
              <p><strong>Material:</strong> {quiz.videoTitle}</p>
            </div>

            <button
                className="quiz-button quiz-button-primary"
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