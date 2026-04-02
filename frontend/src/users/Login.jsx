import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import UserRegister from "./userRegister";
import FloatingInput from "../component/FloatingInput";
import { useNavigate } from "react-router-dom";

export default function Login({ closeModal }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  const navigate = useNavigate();
  const BASE_URL = "http://localhost:8086";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // validation
    if (!formData.username || !formData.password) {
      setError("All fields are required");
      return;
    }

    try {
      const payload = {
        login: formData.username,
        password: formData.password,
      };

      const response = await fetch(`${BASE_URL}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let data;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (response.ok) {
        if (data?.role) {
          localStorage.setItem("role", data.role);
        }

        setSuccess("Login successful!");

        setTimeout(() => {
          closeModal?.();
          navigate("/dashboard");
        }, 800);
      } else {
        setError(data?.message || data || "Invalid username or password");
      }
    } catch (err) {
      setError("Cannot connect to server. Check backend.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        onClick={closeModal}
      />

      {/* login card */}
      <div
        className="relative w-[500px] p-8 rounded-2xl
        backdrop-blur-xl bg-white/20
        border border-white/30 shadow-2xl"
      >
        {/* close button */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 text-white hover:text-red-400"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Login
        </h2>

        {/* messages */}
        {success && (
          <p className="text-green-300 text-center mb-3">{success}</p>
        )}
        {error && <p className="text-red-300 text-center mb-3">{error}</p>}

        {/* form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <FloatingInput
            name="username"
            label="Username or Email"
            value={formData.username}
            onChange={handleChange}
          />

          <FloatingInput
            name="password"
            type="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
          />

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-white/30 hover:bg-white/40 text-white font-semibold"
          >
            Login
          </button>
        </form>

        {/* links */}
        <div className="text-center mt-4 text-sm text-white/80 space-y-2">
          <p>
            Don't have an account?{" "}
            <span
              onClick={() => setShowRegister(true)}
              className="text-sky-400 hover:underline cursor-pointer"
            >
              Register
            </span>
          </p>
        </div>
      </div>

      {/* register modal */}
      {showRegister && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowRegister(false)}
          />

          <UserRegister closeModal={() => setShowRegister(false)} />
        </div>
      )}
    </div>
  );
}