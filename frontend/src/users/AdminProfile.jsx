import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = () => {
    const raw = localStorage.getItem("user");
    const stored = raw ? JSON.parse(raw) : null;

    if (!stored?.email) return;

    axios
      .get(`http://localhost:8086/user/profile?email=${stored.email}`)
      .then((res) => setUser(res.data))
      .catch((err) => console.log(err));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
        <div className="text-gray-600 font-medium animate-pulse">
          Loading profile...
        </div>
      </div>
    );
  }

  const getRoleTitle = (role) => {
    if (!role) return "User Dashboard";
    if (role.toLowerCase() === "admin") return "Admin Dashboard";
    if (role.toLowerCase().includes("academic")) return "Academic Dashboard";
    return "User Dashboard";
  };

  const isAdminOrAcademic =
    user.role?.toLowerCase() === "admin" ||
    user.role?.toLowerCase().includes("academic");

  return (
    <div className="min-h-screen w-[83vw] ml-[17vw] relative flex justify-center items-center overflow-hidden bg-white p-6">

      {/* CENTER CONTAINER */}
      <div className="w-full max-w-6xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.3)] p-6">

        {/* HEADER */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            {getRoleTitle(user.role)}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back, {user.name}
          </p>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* LEFT PROFILE CARD */}
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl p-6 flex flex-col items-center border border-white/40">

            <img
              src={
                user.profileImage ||
                `https://ui-avatars.com/api/?name=${user.username}`
              }
              alt="profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-indigo-500 shadow-md"
            />

            <h2 className="mt-4 text-xl font-semibold text-gray-800">
              {user.name}
            </h2>

            <p className="text-gray-500 text-sm">{user.email}</p>

            <span className="mt-2 px-4 py-1 text-xs bg-indigo-100 text-indigo-600 rounded-full">
              {user.role}
            </span>

            <div className="w-full mt-6 space-y-3">

              {isAdminOrAcademic && (
                <button
                  onClick={() => navigate("/admin/edit-profile")}
                  className="w-full bg-indigo-600 text-white py-2 rounded-xl shadow hover:bg-indigo-700 hover:scale-[1.02] transition"
                >
                  Edit Profile
                </button>
              )}

              <button
                onClick={() => {
                  localStorage.clear();
                  navigate("/");
                  window.location.reload();
                }}
                className="w-full bg-red-500 text-white py-2 rounded-xl shadow hover:bg-red-600 hover:scale-[1.02] transition"
              >
                Logout
              </button>

            </div>
          </div>

          {/* RIGHT */}
          <div className="md:col-span-2 space-y-6">

            {/* INFO CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: "Username", value: user.username },
                { label: "Role", value: user.role },
                { label: "Email Status", value: "Verified", color: "text-green-600" },
                {
                  label: "Account Type",
                  value:
                    user.role?.toLowerCase() === "admin"
                      ? "System Admin"
                      : "Academic Access",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white/70 backdrop-blur-lg p-5 rounded-2xl shadow-md border border-white/40 hover:shadow-lg transition"
                >
                  <p className="text-gray-500 text-sm">{item.label}</p>
                  <p className={`font-semibold ${item.color || "text-gray-800"}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* OVERVIEW */}
            <div className="bg-white/70 backdrop-blur-lg p-6 rounded-3xl shadow-xl border border-white/40">

              <h3 className="font-semibold text-gray-800 mb-6 text-lg">
                {user.role?.toLowerCase() === "admin"
                  ? "System Overview"
                  : "Academic Overview"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

                {[
                  {
                    value: 128,
                    label: user.role?.toLowerCase() === "admin" ? "Users" : "Students",
                  },
                  {
                    value: 24,
                    label: user.role?.toLowerCase() === "admin" ? "Courses" : "Modules",
                  },
                  {
                    value: 7,
                    label: user.role?.toLowerCase() === "admin" ? "Reports" : "Evaluations",
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white p-5 rounded-2xl text-center shadow-lg hover:scale-105 transition"
                  >
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-sm opacity-80">{stat.label}</p>
                  </div>
                ))}

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}