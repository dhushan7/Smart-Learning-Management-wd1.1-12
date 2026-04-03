import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

export default function EditProfile({ closeModal }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [strength, setStrength] = useState(0);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user") || "{}");

    if (!stored?.email) {
      navigate("/");
      return;
    }

    axios
      .get(`http://localhost:8086/user/profile?email=${stored.email}`)
      .then((res) => {
        setUser(res.data);
        setName(res.data.name);
        setPreview(res.data.profileImage);
      })
      .catch(() => {
        Swal.fire("Error", "Failed to load profile", "error");
      });
  }, [navigate]);

  // PASSWORD STRENGTH
  const calculateStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    setStrength(score);
  };

  const handlePasswordChange = (val) => {
    setNewPassword(val);
    calculateStrength(val);
  };

  const strengthLabel = [
    "Very Weak",
    "Weak",
    "Fair",
    "Good",
    "Strong",
    "Very Strong",
  ];

  const strengthColor = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#16a34a",
    "#15803d",
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("email", user.email);
      formData.append("name", name);
      if (imageFile) formData.append("image", imageFile);

      const res = await axios.put(
        "http://localhost:8086/user/update-profile",
        formData
      );

      Swal.fire("Success", "Profile updated", "success");
      localStorage.setItem("user", JSON.stringify(res.data));

      closeModal?.();
      navigate("/profile");
    } catch {
      Swal.fire("Error", "Update failed", "error");
    }
  };

  const handleChangePassword = async () => {
    try {
      const res = await axios.put(
        "http://localhost:8086/user/change-password",
        {
          email: user.email,
          currentPassword,
          newPassword,
        }
      );

      Swal.fire("Success", res.data.message, "success");
      setCurrentPassword("");
      setNewPassword("");
      setStrength(0);
    } catch {
      Swal.fire("Error", "Password update failed", "error");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading profile...
      </div>
    );
  }

  return (
    <div>
        
        {/* BACKDROP */}
        <div
        className="absolute rounded-3xl inset-0 bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200"
        onClick={closeModal}
        />
        <div
        onClick={closeModal}
        />

        {/* MODAL */}
        <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="
            relative z-10
            w-[95vw] max-w-[1000px]
            max-h-[90vh]
            overflow-y-auto
            rounded-3xl
            bg-white/15 backdrop-blur-2xl
            border border-white/30
            shadow-2xl
        "
        >
        {/* HEADER */}
        <div className="relative flex items-center justify-center px-6 py-4 border-b border-white/20">
            <h2 className="text-black font-semibold text-2xl">
            ✨ Edit Profile
            </h2>

            <button
            onClick={closeModal}
            className="absolute right-4 p-2 rounded-full hover:bg-black/10 transition"
            >
            <XMarkIcon className="w-6 h-6 text-black/70 hover:text-red-500" />
            </button>
        </div>

        {/* BODY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            
            {/* LEFT */}
            <div className="bg-white/10 border border-white/20 rounded-2xl p-5">
            <h3 className="text-black font-semibold mb-4">Profile</h3>

            <div className="flex flex-col items-center">
                <img
                src={
                    preview ||
                    `https://ui-avatars.com/api/?name=${user.username}`
                }
                className="w-28 h-28 rounded-full border-4 border-white/30 object-cover"
                alt="profile"
                />

                <label className="mt-3 text-black/70 text-sm cursor-pointer hover:text-black">
                Change Photo
                <input type="file" onChange={handleImageChange} hidden />
                </label>
            </div>

            <div className="mt-5">
                <label className="text-black/60 text-sm">Full Name</label>
                <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 p-3 rounded-xl bg-white/70 text-black border border-white/30"
                />
            </div>

            <button
                onClick={handleUpdateProfile}
                className="w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold"
            >
                Save Changes
            </button>
            </div>

            {/* RIGHT */}
            <div className="bg-white/10 border border-white/20 rounded-2xl p-5">
            <h3 className="text-black font-semibold mb-4">Security</h3>

            <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full mb-3 p-3 rounded-xl bg-white/70 text-black border border-white/30"
            />

            <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="w-full mb-2 p-3 rounded-xl bg-white/70 text-black border border-white/30"
            />

            {newPassword && (
                <div className="mb-4">
                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                    <div
                    className="h-full transition-all duration-300"
                    style={{
                        width: `${(strength / 5) * 100}%`,
                        backgroundColor: strengthColor[strength],
                    }}
                    />
                </div>

                <p
                    className="text-xs mt-1"
                    style={{ color: strengthColor[strength] }}
                >
                    {strengthLabel[strength]}
                </p>
                </div>
            )}

            <button
                onClick={handleChangePassword}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold"
            >
                Update Password
            </button>
            </div>

        </div>
        </motion.div>
    </div>
    );
}