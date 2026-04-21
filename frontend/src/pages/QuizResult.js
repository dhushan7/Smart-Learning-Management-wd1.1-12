import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import "../App.css";

const API_BASE = "http://localhost:8086/api";

function QuizResult() {
  const location = useLocation();
  const navigate = useNavigate();
  // Ref to prevent StrictMode from firing the API call twice
  const hasAwarded = useRef(false);

  const result = location.state;

  // 1. Safely calculate scores in case 'result' is missing
  const score = result?.score || 0;
  const total = result?.total || 1; 
  const percentage = Math.round((score / total) * 100);

  let feedback = "";
  let color = "";

  if (percentage >= 80) {
    feedback = "Outstanding! Excellent work 🏆";
    color = "#16a34a";
  } else if (percentage >= 50) {
    feedback = "Good effort! 👍";
    color = "#ca8a04";
  } else {
    feedback = "Keep practicing 📚";
    color = "#dc2626";
  }

  // 2. ONE unified hook to handle the user check and the API call
  useEffect(() => {
    const giveCredits = async () => {
      // Stop immediately if there's no result OR if we already started the process
      if (!result || hasAwarded.current) {
        return;
      }

      // Lock the gate IMMEDIATELY so StrictMode doesn't fire twice
      hasAwarded.current = true;

      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        console.warn("DEBUG: Could not award credits. No user found in localStorage.");
        return; 
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        const username = parsedUser.username;

        console.log(`DEBUG: Sending +2 credits to backend for studentId: ${username}...`);

        const response = await fetch(`${API_BASE}/credits/award`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: username, // <--- FIXED: Matches your Java backend perfectly
            activity: `Completed Quiz: ${result.title}`,
            credits: 2, 
            // We leave this as AUTO_DOWNLOAD for now because we know your backend accepts it.
            // If you want to change it to "AUTO_QUIZ" later, make sure to add "AUTO_QUIZ" 
            // to your Java backend Enum first!
            type: "AUTO_DOWNLOAD" 
          }),
        });

        if (response.ok) {
          console.log("DEBUG: SUCCESS! +2 Credits awarded.");
        } else {
          console.error("DEBUG: Backend rejected the request. Status:", response.status);
          // If it fails, unlock it so it tries again if they refresh
          hasAwarded.current = false; 
        }
      } catch (err) {
        console.error("DEBUG: Fetch failed.", err);
        hasAwarded.current = false;
      }
    };

    giveCredits();
  }, [result]); // Only re-run if the 'result' changes

  // 3. Early return if they didn't actually take a quiz
  if (!result) {
    return (
      <div className="page-container h-[100vh] flex justify-center items-center">
        <div className="result-box">
          <h2>No result found.</h2>
          <button onClick={() => navigate("/quiz-bank")} className="quiz-button">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // 4. Render the Result UI
  return (
    <div className="page-container h-[100vh] flex justify-center items-center">
      <div className="result-box">
        <h1>Quiz Complete!</h1>
        <h2>{result.title}</h2>

        <h3 style={{ color }}>{feedback}</h3>

        <p className="result-score">
          Score: <strong>{result.score}</strong> / {result.total}
        </p>

        {/* Progress Bar */}
        <div className="w-full h-5 bg-gray-200 rounded-full overflow-hidden mt-4 shadow-inner mb-5">
          <div
            className="h-full flex items-center justify-center text-white text-xs font-semibold rounded-full transition-all duration-700 ease-in-out relative overflow-hidden"
            style={{
              width: `${percentage}%`,
              background:
                percentage >= 80
                  ? "linear-gradient(90deg,#22c55e,#16a34a)"
                  : percentage >= 50
                  ? "linear-gradient(90deg,#facc15,#ca8a04)"
                  : "linear-gradient(90deg,#ef4444,#dc2626)",
            }}
          >
            {/* Shine effect */}
            <div className="absolute top-0 left-[-40%] w-[40%] h-full bg-white/20 skew-x-[-25deg] animate-shine"></div>
            <span className="relative z-10">{percentage}%</span>
          </div>
        </div>

        {/* Credits Earned Display */}
        <p style={{ fontWeight: "600" }} className="text-emerald-600 mb-4">
          🎁 Credits Earned: +2
        </p>

        <div className="result-actions">
          <button className="quiz-button" onClick={() => navigate("/quiz-bank")}>
            Back to Quiz Bank
          </button>
          
          <button
            className="quiz-button"
            style={{ marginLeft: '10px', backgroundColor: '#10b981' }}
            onClick={() => navigate("/credits")} 
          >
            View My Credits
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizResult;