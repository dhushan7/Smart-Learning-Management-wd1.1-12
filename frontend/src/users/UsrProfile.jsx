import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import EditProfile from "./EditProfile";

export default function UsrProfile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    const stored = raw ? JSON.parse(raw) : null;

    if (!stored?.email) return;

    axios
      .get(`http://localhost:8086/user/profile?email=${stored.email}`)
      .then((res) => setUser(res.data))
      .catch((err) => console.log(err));
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200">
        <div className="backdrop-blur-xl bg-white/30 p-6 rounded-xl shadow-lg text-gray-700">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300" />

      {/* MODAL */}
      <div className="relative z-10 w-[60vw] rounded-3xl p-8 flex flex-col items-center space-y-6">

        {/* EDIT MODAL */}
        {showEditProfile && (
          <div className="fixed inset-0 flex items-center justify-center z-50">

            {/* BACKDROP */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowEditProfile(false)}
            />

            {/* MODAL */}
            <div className="relative z-50">
              <EditProfile closeModal={() => setShowEditProfile(false)} />
            </div>

          </div>
        )}

        {/* PROFILE */}
        <div className="text-center">
          <div className="relative inline-block">
            <img
              src={
                user.profileImage ||
                `https://ui-avatars.com/api/?name=${user.username}`
              }
              alt="profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-white/40 shadow-xl"
            />
          </div>

          <h2 className="text-2xl font-bold mt-4 text-gray-800">
            {user.name}
          </h2>

          <p className="text-gray-700">{user.email}</p>

          <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-white/30 text-gray-800 backdrop-blur-md border border-white/40">
            {user.role}
          </span>
        </div>

        {/* INFO */}
        <div className="w-full max-w-md space-y-3 text-sm">

          <div className="flex justify-between bg-white/20 p-3 rounded-xl backdrop-blur-md border border-white/30">
            <span className="font-semibold">Username</span>
            <span>{user.username}</span>
          </div>

          <div className="flex justify-between bg-white/20 p-3 rounded-xl backdrop-blur-md border border-white/30">
            <span className="font-semibold">Name</span>
            <span>{user.name}</span>
          </div>

          <div className="flex justify-between bg-white/20 p-3 rounded-xl backdrop-blur-md border border-white/30">
            <span className="font-semibold">Role</span>
            <span>{user.role}</span>
          </div>

        </div>

        {/* BUTTONS */}
        <div className="w-full max-w-md space-y-3">

          <button
            onClick={() => setShowEditProfile(true)}
            className="w-full bg-white/30 backdrop-blur-md border border-white/40 text-gray-800 py-2 rounded-xl shadow-md hover:scale-105 transition"
          >
            Edit Profile
          </button>

          <button
            onClick={() => {
              localStorage.clear();
              navigate("/");
              window.location.reload();
            }}
            className="w-full bg-red-400/80 backdrop-blur-md text-white py-2 rounded-xl shadow-md hover:bg-red-500 transition"
          >
            Logout
          </button>

        </div>

      </div>
    </div>
  );
}