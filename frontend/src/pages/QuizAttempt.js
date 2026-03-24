import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import quizzes from "../data/quizzes";
import "../App.css";

function QuizAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const quiz = useMemo(() => quizzes.find((q) => q.id === Number(id)), [id]);

  const [answers, setAnswers] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [unansweredIds, setUnansweredIds] = useState([]);

  if (!quiz) {
    return <div className="page-container">Quiz not found.</div>;
  }

  const handleOptionChange = (questionId, selectedOption) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOption,
    }));

    setErrorMessage("");
    setUnansweredIds((prev) => prev.filter((id) => id !== questionId));
  };

  const handleSubmit = () => {
    const unansweredQuestions = quiz.questions.filter(
      (question) => !answers[question.id]
    );

    if (unansweredQuestions.length > 0) {
      const missingIds = unansweredQuestions.map((q) => q.id);

      setUnansweredIds(missingIds);
      setErrorMessage("Please answer all questions before submitting the quiz.");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    let score = 0;

    quiz.questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        score += 1;
      }
    });

    navigate("/quiz-result", {
      state: {
        title: quiz.title,
        score,
        total: quiz.questions.length,
      },
    });
  };

  return (
    <div className="page-container">
      <h1 className="page-title">{quiz.title}</h1>

      <p className="page-subtitle">
        <strong>Subject:</strong> {quiz.subject} |{" "}
        <strong>Video:</strong> {quiz.videoTitle}
      </p>

      {errorMessage && (
        <div className="error-box">
          <strong>Incomplete Quiz:</strong> {errorMessage}
        </div>
      )}

      {quiz.questions.map((question, index) => (
        <div
          key={question.id}
          id={`question-${question.id}`}
          className={`question-card ${
            unansweredIds.includes(question.id) ? "question-error" : ""
          }`}
        >
          <h3>{index + 1}. {question.questionText}</h3>

          {question.options.map((option) => (
            <div key={option} style={{ marginTop: "10px" }}>
              <label>
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={() => handleOptionChange(question.id, option)}
                />
                {" "}
                {option}
              </label>
            </div>
          ))}

          {unansweredIds.includes(question.id) && (
            <p className="question-error-text">
              Please select an answer
            </p>
          )}
        </div>
      ))}

      <button className="quiz-button" onClick={handleSubmit}>
        Submit Quiz
      </button>
    </div>
  );
}

export default QuizAttempt;