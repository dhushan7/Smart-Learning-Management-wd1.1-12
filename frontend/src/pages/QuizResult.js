import { useLocation, useNavigate } from "react-router-dom";
import "../App.css";

function QuizResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const result = location.state;

  if (!result) {
    return (
      <div className="result-box">
        <h2>No result found.</h2>
        <button className="quiz-button" onClick={() => navigate("/quiz-bank")}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="result-box">
      <h1>Quiz Result</h1>
      <h2>{result.title}</h2>
      <p className="result-score">
        You scored <strong>{result.score}</strong> out of <strong>{result.total}</strong>
      </p>

      <button className="quiz-button" onClick={() => navigate("/quiz-bank")}>
        Back to Quiz Bank
      </button>
    </div>
  );
}

export default QuizResult;