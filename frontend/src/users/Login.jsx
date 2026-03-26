import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import UserRegister from "./userRegister";

// ✅ Floating Label Input (same as everywhere)
const FloatingLabelInput = ({
  name,
  type = "text",
  label,
  value,
  onChange,
  required,
}) => (
  <div className="relative w-full">
    <input
      type={type}
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      placeholder=" "
      required={required}
      className="peer w-full px-4 py-3 sm:py-4 rounded-lg border border-gray-400 text-black placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800"
    />
    <label
      htmlFor={name}
      className={`absolute left-4 text-gray-500 text-base transition-all
        peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
        peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-800
        ${value ? "top-1 text-sm text-blue-800" : ""}`}
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
  </div>
);

export default function Login({ closeModal }) {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  const BASE_URL = "http://localhost:8086";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.username || !formData.password) {
      setError("All fields are required");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.text();
        setSuccess("Login successful!");
        console.log("Server Response:", data);

        setTimeout(() => closeModal(), 1000);
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("Cannot connect to server. Check if backend is running.");
    }
  };

  // 🔁 Switch to Register
  if (showRegister) {
    return <UserRegister closeModal={() => setShowRegister(false)} />;
  }

  return (
    <div className="w-[500px] p-8 rounded-2xl backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl relative">

      {/* Close Button */}
      <button
        onClick={closeModal}
        className="absolute top-3 right-3 text-white hover:text-red-400"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      {/* Title */}
      <h2 className="text-2xl font-bold text-white text-center mb-6">
        Login
      </h2>

      {/* Messages */}
      {success && <p className="text-green-300 text-center mb-3">{success}</p>}
      {error && <p className="text-red-300 text-center mb-3">{error}</p>}

      {/* ✅ FORM */}
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">

        <FloatingLabelInput
          name="username"
          label="Username or Email"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <FloatingLabelInput
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
          Login
        </button>

      </form>

      {/* Register Link */}
      <p className="text-white/80 text-sm mt-4 text-center">
        Don't have an account?{" "}
        <span
          onClick={() => setShowRegister(true)}
          className="text-sky-400 hover:underline cursor-pointer"
        >
          Register
        </span>
      </p>
    </div>
  );
}