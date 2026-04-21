import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import quizzes from "../data/quizzes";
import "../App.css";

function QuizAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();

  const quiz = useMemo(
    () => quizzes.find((q) => q.id === Number(id)),
    [id]
  );

  const [answers, setAnswers] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [unansweredIds, setUnansweredIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    const unansweredQuestions = quiz.questions.filter(
      (q) => !answers[q.id]
    );

    if (unansweredQuestions.length > 0) {
      const missingIds = unansweredQuestions.map((q) => q.id);
      setUnansweredIds(missingIds);
      setErrorMessage("Please answer all questions before submitting the quiz.");

      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    let score = 0;
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) score++;
    });

    const total = quiz.questions.length;
    const percentage = (score / total) * 100;

    const email = localStorage.getItem("email") || "guest@gmail.com";

    setSubmitting(true);

    try {
      await fetch("http://localhost:8086/api/quiz-attempts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          quizId: quiz.id,
          quizTitle: quiz.title,
          score,
          totalQuestions: total,
          percentage,
        }),
      });
    } catch (err) {
      console.error("Error saving attempt:", err);
    } finally {
      setSubmitting(false);
    }

    navigate("/quiz-result", {
      state: {
        title: quiz.title,
        score,
        total,
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

      {quiz.questions.map((q, index) => (
        <div
          key={q.id}
          className={`question-card ${
            unansweredIds.includes(q.id) ? "question-error" : ""
          }`}
        >
          <h3>{index + 1}. {q.questionText}</h3>

          {q.options.map((option) => (
            <div key={option} style={{ marginTop: "10px" }}>
              <label>
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  checked={answers[q.id] === option}
                  onChange={() => handleOptionChange(q.id, option)}
                />
                {" "}{option}
              </label>
            </div>
          ))}

          {unansweredIds.includes(q.id) && (
            <p className="question-error-text">Please select an answer</p>
          )}
        </div>
      ))}

      <button
        className="quiz-button"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? "Submitting..." : "Submit Quiz"}
      </button>
    </div>
  );
}

export default QuizAttempt;

// TESTING