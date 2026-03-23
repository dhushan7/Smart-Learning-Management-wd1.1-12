import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

export default function Login({ closeModal }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.text(); 
        setSuccess("Login successful!");
        console.log("Server Response:", data);

        setTimeout(() => {
          closeModal();
        }, 1000);
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("Cannot connect to server. Check if backend is running.");
    }
  };

  return (
    <div className="w-[400px] p-8 rounded-2xl backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl relative">
      <button
        onClick={closeModal}
        className="absolute top-3 right-3 text-white hover:text-red-400"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      <h2 className="text-2xl font-bold text-white text-center mb-6">
        Login
      </h2>

      {success && <p className="text-green-300 text-center mb-3">{success}</p>}
      {error && <p className="text-red-300 text-center mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="username"
          placeholder="Username or Email"
          value={formData.username}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-white"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-white"
        />

        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-white/30 hover:bg-white/40 text-white font-semibold transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}