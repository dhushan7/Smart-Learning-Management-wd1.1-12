import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FloatingInput from "../component/FloatingInput";

export default function AdminCreateUser() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    role: "Student",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const BASE_URL = "http://localhost:8086";

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const validate = () => {
    const err = {};

    if (!user.username) err.username = "Username is required";
    if (!user.name) err.name = "Full name is required";

    if (!user.email) {
      err.email = "Email is required";
    } else if (user.role === "Student") {
      if (!/^[iI][tT]\d{8}@my\.sliit\.lk$/.test(user.email)) {
        err.email = "Use ITXXXXXXXX@my.sliit.lk format";
      }
    }

    if (!user.password) {
      err.password = "Password is required";
    } else if (user.password.length < 6) {
      err.password = "Minimum 6 characters required";
    }

    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});
    setSuccess("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/user/admin/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        setSuccess("User created successfully 🎉");

        setUser({
          username: "",
          name: "",
          email: "",
          password: "",
          role: "Student",
        });

        setTimeout(() => {
          navigate("/admin/users");
        }, 1000);
      } else {
        setErrors({ submit: "Failed to create user" });
      }
    } catch {
      setErrors({ submit: "Server not responding" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-blue-50 to-indigo-100">

      {/* BACK CLICK AREA */}
      <div
        className="absolute inset-0"
        onClick={() => navigate("/admin/users")}
      />

      {/* GLASS CARD */}
      <div className="relative w-[500px] p-8 rounded-3xl 
        bg-white/60 backdrop-blur-2xl 
        border border-white/40 
        shadow-[0_8px_32px_rgba(0,0,0,0.1)] 
        z-10">

        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Admin Create User
        </h2>

        {success && (
          <p className="text-green-600 text-center mb-3">{success}</p>
        )}

        {errors.submit && (
          <p className="text-red-500 text-center mb-3">{errors.submit}</p>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <FloatingInput
            name="username"
            label="Username"
            value={user.username}
            onChange={handleChange}
          />
          {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}

          <FloatingInput
            name="name"
            label="Full Name"
            value={user.name}
            onChange={handleChange}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

          <FloatingInput
            name="email"
            type="email"
            label="Email"
            value={user.email}
            onChange={handleChange}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

          <FloatingInput
            name="password"
            type="password"
            label="Password"
            value={user.password}
            onChange={handleChange}
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

          {/* ROLE SELECT */}
          <select
            name="role"
            value={user.role}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg 
              bg-white/70 backdrop-blur-md 
              border border-gray-300 
              text-gray-700 
              focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="Student">Student</option>
            <option value="Admin">Admin</option>
            <option value="Academic Panel">Academic Panel</option>
          </select>

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full py-2 rounded-lg 
              bg-indigo-600 hover:bg-indigo-700 
              text-white font-semibold 
              shadow-md transition"
          >
            Create User
          </button>
        </form>
      </div>
    </div>
  );
}