import { useLocation, useNavigate } from "react-router-dom";
import "../App.css";

function QuizResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const result = location.state;

  if (!result) {
    return (
      <div className="page-container">
        <div className="result-box">
          <h2>No result found.</h2>
          <button onClick={() => navigate("/quiz-bank")} className="quiz-button">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const percentage = Math.round((result.score / result.total) * 100);

  let feedback = "";
  let color = "";
  let credits = 0;

  if (percentage >= 80) {
    feedback = "Outstanding! Excellent work 🏆";
    color = "#16a34a";
    credits = 10;
  } else if (percentage >= 50) {
    feedback = "Good effort! 👍";
    color = "#ca8a04";
    credits = 5;
  } else {
    feedback = "Keep practicing 📚";
    color = "#dc2626";
    credits = 2;
  }

  return (
    <div className="page-container">
      <div className="result-box">
        <h1>Quiz Complete!</h1>
        <h2>{result.title}</h2>

        <h3 style={{ color }}>{feedback}</h3>

        <p className="result-score">
          Score: <strong>{result.score}</strong> / {result.total}
        </p>

        {/* Progress Bar */}
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          >
            <span className="progress-bar-text">{percentage}%</span>
          </div>
        </div>

        {/* Credits */}
        <p style={{ fontWeight: "600" }}>
          🎁 Credits Earned: +{credits}
        </p>

        <div className="result-actions">
          <button
            className="quiz-button"
            onClick={() => navigate("/quiz-bank")}
          >
            Back to Quiz Bank
          </button>

          {/* <button
            className="quiz-button"
            onClick={() => navigate("/my-attempts")}
          >
            View My Attempts
          </button> */}
        </div>
      </div>
    </div>
  );
}

export default QuizResult;