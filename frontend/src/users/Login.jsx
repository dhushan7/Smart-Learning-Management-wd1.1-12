import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import UserRegister from "./userRegister";
import StaffLogin from "./StaffLogin";
import FloatingInput from "../component/FloatingInput";

export default function Login({ closeModal }) {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showRegister, setShowRegister] = useState(false);
  const [showStaffLogin, setShowStaffLogin] = useState(false);


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
        setSuccess("Login successful!");
        setTimeout(() => closeModal(), 1000);
      } else {
        setError("Invalid username or password");
      }
    } catch {
      setError("Cannot connect to server. Check backend.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">

      {/* BACKDROP */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        onClick={closeModal}
      />

      {/* LOGIN CARD */}
      <div className="relative w-[500px] p-8 rounded-2xl
                      backdrop-blur-xl bg-white/20
                      border border-white/30 shadow-2xl">

        {/* CLOSE */}
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

        {/* LINKS */}
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

          {/* <p>
            Are you staff?{" "}
            <span
              onClick={() => setShowStaffLogin(true)}
              className="text-yellow-300 hover:underline cursor-pointer"
            >
              Staff Login
            </span>
          </p> */}
        </div>
      </div>

      {/* ================= SUB MODALS ================= */}

      {showRegister && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowRegister(false)}
          />
          <UserRegister closeModal={() => setShowRegister(false)} />
        </div>
      )}

      {/* {showStaffLogin && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowStaffLogin(false)}
          />
          <StaffLogin closeModal={() => setShowStaffLogin(false)} />
        </div>
      )} */}

    </div>
  );
}