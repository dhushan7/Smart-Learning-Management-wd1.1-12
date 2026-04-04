import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

export default function EditProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const stored = JSON.parse(localStorage.getItem("user") || "{}");
  const role = (stored?.role || "").toLowerCase();

  const getUpdateUrl = () => {
    if (role === "admin") return "http://localhost:8086/user/admin/update-profile";
    if (role.includes("academic")) return "http://localhost:8086/user/academic/update-profile";
    return "http://localhost:8086/user/update-profile";
  };

  useEffect(() => {
    if (!stored?.email) {
      navigate("/");
      return;
    }

    axios
      .get("http://localhost:8086/user/profile", {
        params: { email: stored.email },
      })
      .then((res) => {
        setUser(res.data);
        setName(res.data.name);
        setPreview(res.data.profileImage);
      })
      .catch(() => {
        Swal.fire("Error", "Failed to load profile", "error");
      });
  }, [navigate, stored?.email]);

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

      const res = await axios.put(getUpdateUrl(), formData);

      Swal.fire("Success", "Profile updated", "success").then(() => {
        localStorage.setItem("user", JSON.stringify(res.data));
        navigate(-1);
      });
    } catch (err) {
      console.log(err);
      Swal.fire("Error", "Update failed", "error");
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Swal.fire("Warning", "Please fill in all password fields", "warning");
      return;
    }

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
    } catch {
      Swal.fire("Error", "Password update failed", "error");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 ml-[17vw]">
        <div className="text-gray-600 font-medium">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-[83vw] ml-[17vw] relative flex justify-center items-center overflow-hidden bg-white p-6">
    <div className="w-full max-w-6xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.3)] p-6">
      {/* HEADER */}
      <div className="w-full max-w-4xl mb-6 flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded-full shadow hover:bg-gray-50 transition"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-700" />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-800">Edit Profile</h1>
          <p className="text-gray-500 text-sm">
            Update your {role || "user"} account settings
          </p>
        </div>
      </div>

      {/* MAIN CARD (NO ANIMATION) */}
      <div className="w-fullmax-w-4xl bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="grid grid-cols-3">

          {/* LEFT */}
          <div className="col-span-1 bg-gray-50 p-8 flex flex-col items-center border-r border-gray-100">
            <img
              src={
                preview ||
                `https://ui-avatars.com/api/?name=${user.username}`
              }
              className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500 shadow-sm"
              alt="Profile Preview"
            />

            <h3 className="mt-4 font-semibold text-gray-800 text-lg">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.role}</p>

            <label className="mt-6 text-sm font-medium text-indigo-600 cursor-pointer hover:underline">
              Change Photo
              <input type="file" hidden accept="image/*" onChange={handleImageChange} />
            </label>

            <button
              onClick={handleUpdateProfile}
              className="mt-8 w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm"
            >
              Save Profile
            </button>
          </div>

          {/* RIGHT */}
          <div className="col-span-2 p-8 space-y-8">

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Personal Information
              </h3>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Security
              </h3>

              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg"
              />

              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg"
              />

              <button
                onClick={handleChangePassword}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg transition"
              >
                Update Password
              </button>
            </div>

          </div>
        </div>
      </div>
      </div>
    </div>
  );
}