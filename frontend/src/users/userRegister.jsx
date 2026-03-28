import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import FloatingInput from "../component/FloatingInput";
import Login from "./Login";

export default function UserRegister({ closeModal, openLogin }) {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [showUserLogin, setShowUserLogin] = useState(false);
  const BASE_URL = "http://localhost:8086";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const err = {};

    if (!formData.username) err.username = "Username is required";
    if (!formData.name) err.name = "Full name is required";

    if (!formData.email) {
      err.email = "Email is required";
    } else if (!/^[iI][tT]\d{8}@my\.sliit\.lk$/.test(formData.email)) {
      err.email = "Use ITXXXXXXXX@my.sliit.lk format";
    }

    if (!formData.password) {
      err.password = "Password is required";
    } else if (formData.password.length < 6) {
      err.password = "Minimum 6 characters required";
    }

    if (formData.password !== formData.confirmPassword) {
      err.confirmPassword = "Passwords do not match";
    }

    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const emailRes = await fetch(
        `${BASE_URL}/user/check-email/${formData.email}`
      );
      const exists = await emailRes.json();

      if (exists) {
        setErrors({ email: "Email already exists" });
        return;
      }

      const response = await fetch(`${BASE_URL}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "Student",
        }),
      });

      if (response.ok) {
        setSuccess("Student registered successfully 🎉");

        setFormData({
          username: "",
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });

        setTimeout(() => closeModal(), 1200);
      } else {
        setErrors({ submit: "Registration failed" });
      }
    } catch {
      setErrors({ submit: "Server not responding. Please try again." });
    }
  };

  // ✅ FIX: safe login handler
  const handleLoginClick = () => {
    if (openLogin) {
      openLogin();
    } else {
      console.warn("openLogin function is not provided from parent component");
    }
  };
  if (showUserLogin) {
    return <Login closeModal={() => setShowUserLogin(false)} />;
  }

  return (
    <div
      className="relative w-[500px] p-8 rounded-2xl
                 bg-white/20 backdrop-blur-xl
                 border border-white/30 shadow-2xl"
    >
      {/* CLOSE BUTTON */}
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

      {success && (
        <p className="text-green-300 text-center mb-3">{success}</p>
      )}
      {errors.submit && (
        <p className="text-red-300 text-center mb-3">{errors.submit}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FloatingInput
          name="username"
          label="Username"
          value={formData.username}
          onChange={handleChange}
        />
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
        {errors.email && (
          <p className="text-red-300 text-sm">{errors.email}</p>
        )}

        <FloatingInput
          name="password"
          type="password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password && (
          <p className="text-red-300 text-sm">{errors.password}</p>
        )}

        <FloatingInput
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
        {errors.confirmPassword && (
          <p className="text-red-300 text-sm">
            {errors.confirmPassword}
          </p>
        )}

        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-white/30 hover:bg-white/40 text-white font-semibold"
        >
          Register as Student
        </button>
      </form>

      {/* LOGIN LINK (FIXED) */}
      <div className="text-center mt-5 text-white text-sm">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => setShowUserLogin(true)}
          className="text-blue-200 hover:underline"
        >
          Login here
        </button>
      </div>
    </div>
  );
}