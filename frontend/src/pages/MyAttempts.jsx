import { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";

function MyAttempts() {
  const [attempts, setAttempts] = useState([]);

  // 🔥 Secure Extraction: Parse the user object from localStorage to get the email and token
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const email = storedUser?.email;
  const token = storedUser?.token; // 🔑 Extracting backend-issued JWT token

  useEffect(() => {
    // Only attempt the network fetch if a valid authentication token exists
    if (!email || !token) return;
    
    const fetchAttempts = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8086/api/quiz-attempts/user/${email}`,
          {
            headers: {
              // 🔑 Attaching JWT Bearer Header to pass Spring Security filters safely
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setAttempts(res.data);
      } catch (err) {
        console.error("Failed to load secure quiz attempt history:", err);
      }
    };

    fetchAttempts();
  }, [email, token]); // Added dependencies to monitor react component lifecycles cleanly

  return (
    <div className="page-container">
      <h1 className="page-title">My Quiz Attempts</h1>

      <div className="quiz-grid">
        {attempts.map((a) => (
          <div key={a.id} className="quiz-card">
            <h2>{a.quizTitle}</h2>
            <p>Score: {a.score}/{a.totalQuestions}</p>
            <p>Percentage: {a.percentage ? a.percentage.toFixed(1) : "0.0"}%</p>
            <p>Date: {a.attemptedAt ? new Date(a.attemptedAt).toLocaleString() : "—"}</p>
          </div>
        ))}

        {attempts.length === 0 && (
          <p style={{ textAlign: "center" }} className="col-span-full text-gray-500 mt-4">
            No attempts yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default MyAttempts;