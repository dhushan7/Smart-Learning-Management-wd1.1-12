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

  // username availability
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  // PASSWORD STRENGTH
  const [strength, setStrength] = useState(0);

  const strengthLabel = [
    "Very Weak",
    "Weak",
    "Fair",
    "Good",
    "Strong",
    "Very Strong",
  ];

  const strengthColor = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#16a34a",
    "#15803d",
  ];

  const calculateStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    setStrength(score);
  };

  // timer
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((p) => p - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // handle change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handlePasswordChange = (val) => {
    setFormData({ ...formData, password: val });
    calculateStrength(val);
  };

  // CHECK USERNAME EXISTS
  const checkUsername = async (username) => {
    if (!username) return;

    setUsernameChecking(true);

    try {
      const res = await fetch(
        `${BASE_URL}/user/check-username?username=${username}`
      );

      const data = await res.text();

      if (res.ok) {
        setUsernameAvailable(true);
        setErrors((prev) => ({ ...prev, username: "" }));
      } else {
        setUsernameAvailable(false);
        setErrors((prev) => ({ ...prev, username: data }));
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        username: "Cannot check username",
      }));
      setUsernameAvailable(false);
    }

    setUsernameChecking(false);
  };

  // validations
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

  // OTP send
  const sendOTP = async () => {
    const validationErrors = validate();

    if (validationErrors.username) {
      setErrors(validationErrors);
      return;
    }

    if (usernameAvailable === false) {
      setErrors({ username: "Username already exists" });
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
        setTimer(60);
        setSuccess("OTP sent to your email 📧");
      } else {
        setErrors({ email: data });
      }
    } catch {
      setErrors({ submit: "Failed to send OTP" });
    }

    setLoading(false);
  };

  // register
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
      const res = await fetch(
        `${BASE_URL}/user/verify-otp-register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, otp }),
        }
      );

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

  // login modal
  if (showUserLogin) {
    return <Login closeModal={() => setShowUserLogin(false)} />;
  }

  return (
    <div className="relative w-[500px] p-8 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl">

      <button
        onClick={closeModal}
        className="absolute top-3 right-3 text-white hover:text-red-400"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      <h2 className="text-2xl font-bold text-white text-center mb-6">
        Student Registration
      </h2>

      {success && <p className="text-green-300 text-center">{success}</p>}
      {errors.submit && <p className="text-red-300 text-center">{errors.submit}</p>}

      <form onSubmit={handleRegister} className="space-y-4">

        {/* USERNAME */}
        <FloatingInput
          name="username"
          label="Username"
          value={formData.username}
          onChange={handleChange}
          onBlur={() => checkUsername(formData.username)}
        />

        {usernameChecking && (
          <p className="text-yellow-200 text-sm">Checking username...</p>
        )}

        {usernameAvailable === true && formData.username && (
          <p className="text-green-300 text-sm">Username available ✅</p>
        )}

        {errors.username && (
          <p className="text-red-300 text-sm">{errors.username}</p>
        )}

        <FloatingInput
          name="name"
          label="Full Name"
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && <p className="text-red-300 text-sm">{errors.name}</p>}

        <FloatingInput
          name="email"
          label="SLIIT Email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <p className="text-red-300 text-sm">{errors.email}</p>}

        <FloatingInput
          type="password"
          name="password"
          label="Password"
          value={formData.password}
          onChange={(e) => handlePasswordChange(e.target.value)}
        />

        {errors.password && (
          <p className="text-red-300 text-sm">{errors.password}</p>
        )}

        {formData.password && (
          <div>
            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${(strength / 5) * 100}%`,
                  backgroundColor: strengthColor[strength],
                }}
              />
            </div>
            <p
              className="text-xs mt-1"
              style={{ color: strengthColor[strength] }}
            >
              {strengthLabel[strength]}
            </p>
          </div>
        )}

        <FloatingInput
          type="password"
          name="confirmPassword"
          label="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
        />

        {errors.confirmPassword && (
          <p className="text-red-300 text-sm">{errors.confirmPassword}</p>
        )}

        {/* OTP */}
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
          <div className="flex justify-between text-sm">
            <span className="text-green-300">OTP Sent ✅</span>
            {timer > 0 ? (
              <span className="text-yellow-300">Resend in {timer}s</span>
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

        {otpSent && (
          <>
            <FloatingInput
              name="otp"
              label="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            {errors.otp && (
              <p className="text-red-300 text-sm">{errors.otp}</p>
            )}
          </>
        )}

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