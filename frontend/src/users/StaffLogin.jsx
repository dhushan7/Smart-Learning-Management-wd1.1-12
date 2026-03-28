import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import Login from "./Login";
import FloatingInput from "../component/FloatingInput";

export default function StaffLogin({ closeModal }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showUserLogin, setShowUserLogin] = useState(false);

  const BASE_URL = "http://localhost:8086";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.username || !formData.password) {
      setError("All fields are required");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const user = await res.json();

        if (user.role === "Student") {
          setError("Not allowed here");
          return;
        }

        setSuccess("Login successful!");

        setTimeout(() => {
          if (user.role === "Admin") {
            window.location.href = "/admin";
          } else {
            window.location.href = "/academic";
          }
        }, 800);
      } else {
        setError("Invalid username or password");
      }
    } catch {
      setError("Cannot connect to server");
    }
  };

  if (showUserLogin) {
    return <Login closeModal={() => setShowUserLogin(false)} />;
  }

  return (
    // ✅ FULL SCREEN CENTER MODAL WRAPPER
    <div className="fixed inset-0 flex items-center justify-center z-50">

      {/* BACKDROP */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        onClick={closeModal}
      />

      {/* GLASS CARD */}
      <div className="relative w-[500px] p-8 rounded-2xl backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl">

        {/* CLOSE BUTTON */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 text-white hover:text-red-400"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* TITLE */}
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Staff Login
        </h2>

        {/* MESSAGES */}
        {success && (
          <p className="text-green-300 text-center mb-3">{success}</p>
        )}
        {error && (
          <p className="text-red-300 text-center mb-3">{error}</p>
        )}

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-4">

          <FloatingInput
            name="username"
            label="Username or Email"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <FloatingInput
            name="password"
            type="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-white/30 hover:bg-white/40 text-white font-semibold transition"
          >
            Login as Staff
          </button>
        </form>

        {/* LINK */}
        <p className="text-white/80 text-sm mt-4 text-center">
          Not a staff member?{" "}
          <span
            onClick={() => setShowUserLogin(true)}
            className="text-sky-400 hover:underline cursor-pointer"
          >
            User Login
          </span>
        </p>

      </div>
    </div>
  );
}