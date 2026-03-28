import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import FloatingInput from "../component/FloatingInput";
import Login from "./Login";

export default function UserRegister({ closeModal, openLogin }) {
  const BASE_URL = "http://localhost:8086";

  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [showUserLogin, setShowUserLogin] = useState(false);

  // =========================
  // TIMER EFFECT
  // =========================
  useEffect(() => {
    let interval;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timer]);

  // =========================
  // HANDLE CHANGE
  // =========================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // =========================
  // VALIDATION
  // =========================
  const validate = () => {
    const err = {};

    if (!formData.username) err.username = "Username required";
    if (!formData.name) err.name = "Full name required";

    if (!formData.email) {
      err.email = "Email required";
    } else if (!/^[iI][tT]\d{8}@my\.sliit\.lk$/.test(formData.email)) {
      err.email = "Use ITXXXXXXXX@my.sliit.lk";
    }

    if (!formData.password) {
      err.password = "Password required";
    } else if (formData.password.length < 6) {
      err.password = "Min 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      err.confirmPassword = "Passwords do not match";
    }

    return err;
  };

  // =========================
  // SEND OTP
  // =========================
  const sendOTP = async () => {
    const validationErrors = validate();
    if (validationErrors.email) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccess("");

    try {
      const res = await fetch(`${BASE_URL}/user/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.text();

      if (res.ok) {
        setOtpSent(true);
        setTimer(60); // 🔥 start countdown
        setSuccess("OTP sent to your email 📧");
      } else {
        setErrors({ email: data });
      }
    } catch {
      setErrors({ submit: "Failed to send OTP" });
    }

    setLoading(false);
  };

  // =========================
  // REGISTER
  // =========================
  const handleRegister = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!otp) {
      setErrors({ otp: "Enter OTP" });
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccess("");

    try {
      const res = await fetch(`${BASE_URL}/user/verify-otp-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          otp: otp,
        }),
      });

      const data = await res.text();

      if (res.ok) {
        setSuccess("Registered successfully 🎉");

        setTimeout(() => {
          closeModal();
          if (openLogin) openLogin();
        }, 1200);
      } else {
        setErrors({ submit: data });
      }
    } catch {
      setErrors({ submit: "Server error" });
    }

    setLoading(false);
  };

  if (showUserLogin) {
    return <Login closeModal={() => setShowUserLogin(false)} />;
  }

  return (
    <div className="relative w-[500px] p-8 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl">

      {/* CLOSE */}
      <button
        onClick={closeModal}
        className="absolute top-3 right-3 text-white hover:text-red-400"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      {/* TITLE */}
      <h2 className="text-2xl font-bold text-white text-center mb-6">
        Student Registration
      </h2>

      {success && <p className="text-green-300 text-center">{success}</p>}
      {errors.submit && <p className="text-red-300 text-center">{errors.submit}</p>}

      <form onSubmit={handleRegister} className="space-y-4">

        <FloatingInput name="username" label="Username" value={formData.username} onChange={handleChange} />
        {errors.username && <p className="text-red-300 text-sm">{errors.username}</p>}

        <FloatingInput name="name" label="Full Name" value={formData.name} onChange={handleChange} />
        {errors.name && <p className="text-red-300 text-sm">{errors.name}</p>}

        <FloatingInput name="email" label="SLIIT Email" value={formData.email} onChange={handleChange} />
        {errors.email && <p className="text-red-300 text-sm">{errors.email}</p>}

        <FloatingInput type="password" name="password" label="Password" value={formData.password} onChange={handleChange} />
        {errors.password && <p className="text-red-300 text-sm">{errors.password}</p>}

        <FloatingInput type="password" name="confirmPassword" label="Confirm Password" value={formData.confirmPassword} onChange={handleChange} />
        {errors.confirmPassword && <p className="text-red-300 text-sm">{errors.confirmPassword}</p>}
        {/* SEND / RESEND OTP */}
        {!otpSent ? (
          <button
            type="button"
            onClick={sendOTP}
            disabled={loading}
            className="w-full py-2 rounded-lg bg-blue-500 text-white"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        ) : (
          <div className="flex justify-between items-center text-sm">
            <span className="text-green-300">OTP Sent ✅</span>

            {timer > 0 ? (
              <span className="text-yellow-300">
                Resend in {timer}s
              </span>
            ) : (
              <button
                type="button"
                onClick={sendOTP}
                className="text-blue-300 underline"
              >
                Resend OTP
              </button>
            )}
          </div>
        )}

        {/* OTP INPUT */}
        {otpSent && (
          <>
            <FloatingInput
              name="otp"
              label="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            {errors.otp && <p className="text-red-300 text-sm">{errors.otp}</p>}
          </>
        )}
        {/* REGISTER BUTTON */}
        {otpSent && (
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-green-500 text-white"
          >
            {loading ? "Registering..." : "Verify & Register"}
          </button>
        )}

      </form>

      {/* LOGIN LINK */}
      <div className="text-center mt-5 text-white text-sm">
        Already have an account?{" "}
        <button
          onClick={() => setShowUserLogin(true)}
          className="text-blue-200 hover:underline"
        >
          Login here
        </button>
      </div>

    </div>
  );
}