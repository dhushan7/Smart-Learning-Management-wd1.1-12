import { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";

function MyAttempts() {
  const [attempts, setAttempts] = useState([]);
  const email = localStorage.getItem("email");

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8086/api/quiz-attempts/user/${email}`
      );
      setAttempts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">My Quiz Attempts</h1>

      <div className="quiz-grid">
        {attempts.map((a) => (
          <div key={a.id} className="quiz-card">
            <h2>{a.quizTitle}</h2>
            <p>Score: {a.score}/{a.totalQuestions}</p>
            <p>Percentage: {a.percentage.toFixed(1)}%</p>
            <p>Date: {new Date(a.attemptedAt).toLocaleString()}</p>
          </div>
        ))}

        {attempts.length === 0 && (
          <p style={{ textAlign: "center" }}>No attempts yet.</p>
        )}
      </div>
    </div>
  );
}

export default MyAttempts;