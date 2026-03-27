import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import Login from "./Login";

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
      className="peer w-full px-4 py-3 sm:py-4 rounded-lg border border-gray-400 text-black placeholder-transparent focus:outline-none focus:ring-2 focus:ring-black"
    />
    <label
      htmlFor={name}
      className={`absolute left-4 text-gray-500 text-base transition-all
        peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
        peer-focus:top-1 peer-focus:text-sm peer-focus:text-gray-900
        ${value ? "top-1 text-sm text-gray-900" : ""}`}
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
  </div>
);

export default function UserRegister({ closeModal }) {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  const BASE_URL = "http://localhost:8086";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.name) newErrors.name = "Name is required";

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccess("");
    setErrors({});

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const emailRes = await fetch(
        `${BASE_URL}/user/check-email/${formData.email}`
      );
      const isEmailAvailable = await emailRes.json();

      if (!isEmailAvailable) {
        setErrors({ email: "Email already exists" });
        return;
      }

      const response = await fetch(`${BASE_URL}/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        setSuccess("User registered successfully!");
        setFormData({
          username: "",
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });

        setTimeout(() => {
          closeModal();
        }, 1500);
      } else {
        const err = await response.json();
        setErrors({ submit: err.message || "Registration failed" });
      }
    } catch (error) {
      setErrors({
        submit: "Cannot connect to server. Check if backend is running.",
      });
    }
  };

  // 🔁 Switch to Login
  if (showLogin) {
    return <Login closeModal={() => setShowLogin(false)} />;
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
        Create Account
      </h2>

      {/* Messages */}
      {success && (
        <p className="text-green-300 text-center mb-3">{success}</p>
      )}
      {errors.submit && (
        <p className="text-red-300 text-center mb-3">{errors.submit}</p>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        <FloatingLabelInput
          name="username"
          label="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        {errors.username && <p className="text-red-300 text-sm">{errors.username}</p>}

        <FloatingLabelInput
          name="name"
          label="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        {errors.name && <p className="text-red-300 text-sm">{errors.name}</p>}

        <FloatingLabelInput
          name="email"
          type="email"
          label="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {errors.email && <p className="text-red-300 text-sm">{errors.email}</p>}

        <FloatingLabelInput
          name="password"
          type="password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {errors.password && <p className="text-red-300 text-sm">{errors.password}</p>}

        <FloatingLabelInput
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        {errors.confirmPassword && (
          <p className="text-red-300 text-sm">{errors.confirmPassword}</p>
        )}

        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-white/30 hover:bg-white/40 text-white font-semibold transition"
        >
          Register
        </button>
      </form>

      {/* Login Link */}
      <p className="text-white/80 text-sm mt-4 text-center">
        Already have an account?{" "}
        <span
          onClick={() => setShowLogin(true)}
          className="text-sky-400 hover:underline cursor-pointer"
        >
          Login
        </span>
      </p>
    </div>
  );
}