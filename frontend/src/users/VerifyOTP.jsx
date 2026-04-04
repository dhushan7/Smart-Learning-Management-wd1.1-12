import React, { useState, useEffect } from "react";

export default function VerifyOTP({ email, closeModal }) {
  const BASE_URL = "http://localhost:8086";

  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // timer
  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  // verify + create user
  const verifyOTP = async () => {
    setError("");

    const savedData = JSON.parse(localStorage.getItem("registerData"));

    try {
      const res = await fetch(`${BASE_URL}/user/verify-otp-register`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          ...savedData,
          otp: otp,
        }),
      });

      const data = await res.text();

      if (res.ok) {
        setSuccess("Registration successful 🎉");

        localStorage.removeItem("registerData");

        setTimeout(() => closeModal(), 1200);
      } else {
        setError(data);
      }
    } catch {
      setError("Server error");
    }
  };

  // resend OTP
  const resendOTP = async () => {
    await fetch(`${BASE_URL}/user/send-otp`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email }),
    });

    setTimer(60);
  };

  return (
    <div className="p-8 bg-white/20 rounded-xl text-white">
      <h2 className="text-xl mb-4">Verify OTP</h2>

      <p className="text-sm mb-2">Sent to: {email}</p>

      <input
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter OTP"
        className="input"
      />

      {error && <p className="text-red-300">{error}</p>}
      {success && <p className="text-green-300">{success}</p>}

      <button onClick={verifyOTP} className="btn-green mt-3">
        Verify & Register
      </button>

      <div className="mt-3">
        {timer > 0 ? (
          <p>Resend in {timer}s</p>
        ) : (
          <button onClick={resendOTP} className="text-blue-300 underline">
            Resend OTP
          </button>
        )}
      </div>
    </div>
  );
}