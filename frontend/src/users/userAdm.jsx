import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { XMarkIcon } from "@heroicons/react/24/solid";
import Swal from "sweetalert2";

// Floating Input
const FloatingLabelInput = ({
  name,
  type = "text",
  label,
  value,
  onChange,
  required,
  disabled,
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
      disabled={disabled}
      className={`peer w-full px-4 py-3 rounded-lg border text-black placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
        disabled ? "bg-gray-200 cursor-not-allowed" : "bg-white border-gray-300"
      }`}
    />
    <label
      htmlFor={name}
      className={`absolute left-4 text-gray-500 transition-all
        peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base
        peer-focus:top-1 peer-focus:text-sm peer-focus:text-indigo-600
        ${value ? "top-1 text-sm text-indigo-600" : "top-3.5"}`}
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
  </div>
);

export default function UserAdm() {
  const BASE_URL = "http://localhost:8086/user";

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;

  const [editingUser, setEditingUser] = useState(null);

  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(BASE_URL);
      setUsers(res.data);
      setFilteredUsers(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // search
  useEffect(() => {
    const filtered = users.filter((u) =>
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.username || "").toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [search, users]);

  const showSuccess = (title, text) => {
    Swal.fire({
      title,
      text,
      icon: "success",
      timer: 1600,
      showConfirmButton: false,
      background: "rgba(255,255,255,0.08)",
      backdrop: "rgba(0,0,0,0.6)",
      customClass: {
        popup: `
          rounded-2xl
          border border-green-400/20
          shadow-2xl
          backdrop-blur-xl
          bg-white/10
          text-white
        `,
        title: "text-white font-semibold",
        htmlContainer: "text-white/80",
      },
    });
  };

  const deleteUser = async (id) => {
    if (role !== "Admin") {
      Swal.fire("Access Denied", "Only Admin can delete users", "error");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This user will be permanently deleted!",
      icon: "warning",

      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",

      background: "rgba(255,255,255,0.08)",

      backdrop: `
        rgba(0,0,0,0.65)
      `,

      customClass: {
        popup: `
          rounded-2xl
          border border-red-400/20
          shadow-2xl
          backdrop-blur-xl
          bg-white/10
          text-white
        `,
        title: "text-white font-semibold",
        htmlContainer: "text-white/80",

        confirmButton: `
          bg-red-600 hover:bg-red-700
          text-white font-medium
          px-4 py-2 rounded-lg
          shadow-lg shadow-red-500/30 mr-3
        `,

        cancelButton: `
          bg-white/10 hover:bg-white/20
          text-white border border-white/20
          px-4 py-2 rounded-lg
        `,
      },

      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${BASE_URL}/${id}`);

      showSuccess("Deleted!", "User has been removed successfully");

      fetchUsers();
    } catch (err) {
      console.error(err);

      Swal.fire("Error", "Failed to delete user", "error");
    }
  };

  const updateUser = async () => {
    if (role !== "Admin") {
      Swal.fire("Access Denied", "Only Admin can update users", "error");
      return;
    }

    if (editingUser.role === "Student") {
      Swal.fire("Not Allowed", "Admin cannot update student details", "warning");
      return;
    }

    const result = await Swal.fire({
    title: "Save changes?",
    text: "Do you want to update this user?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, update",
    cancelButtonText: "Cancel",

    background: "rgba(255,255,255,0.08)",

    backdrop: `
      rgba(0,0,0,0.6)
    `,

    customClass: {
      popup: `
        rounded-2xl
        border border-white/20
        shadow-2xl
        backdrop-blur-xl
        bg-white/10
        text-white
      `,
      title: "text-white font-semibold",
      htmlContainer: "text-white/80",
      confirmButton: `
        bg-indigo-600 hover:bg-indigo-700
        text-white font-medium
        px-4 py-2 rounded-lg
        shadow-lg shadow-indigo-500/30 mr-3
      `,
      cancelButton: `
        bg-white/10 hover:bg-white/20
        text-white border border-white/20
        px-4 py-2 rounded-lg
      `,
    },

    buttonsStyling: false,
  });

    if (!result.isConfirmed) return;

    try {
      await axios.put(`${BASE_URL}/${editingUser.id}`, editingUser);

      setEditingUser(null);

      showSuccess("Updated!", "User details updated successfully");

      fetchUsers();
    } catch (err) {
      console.error(err);

      Swal.fire("Error", "Failed to update user", "error");
    }
  };

  
  // Pagination
  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const getRoleBadge = (role) => {
    switch (role) {
      case "Admin":
        return "bg-red-500";
      case "Student":
        return "bg-green-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="min-h-screen w-[83vw] ml-[17vw] bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 p-8 text-white">
      

      <div className="flex justify-between items-center mb-8 mt-20">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        <div className="flex gap-3 items-center mb-10">
        {/* CREATE STAFF BUTTON */}
        {role === "Admin" && (
          <button
            onClick={() => navigate("/admin/create-staff")}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium shadow-lg shadow-indigo-500/30 transition"
          >
            + Create New User
          </button>
        )}

        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg text-black w-80 focus:ring-2 focus:ring-indigo-500"
        />
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <>
          {/* table */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/10 text-gray-300">
                <tr>
                  <th className="p-4">ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t border-white/10 hover:bg-white/5 transition"
                  >
                    <td className="p-4">{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.username}</td>

                    {/* ROLE BADGE */}
                    <td>
                      <span
                        className={`px-3 py-1 text-xs rounded-full text-white ${getRoleBadge(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* action */}
                    <td className="flex gap-2 p-2">
                      
                      {/* edit */}
                      {role === "Admin" && user.role !== "Student" && (
                        <button
                          onClick={() => setEditingUser(user)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm"
                        >
                          Edit
                        </button>
                      )}

                      {/* delete */}
                      {role === "Admin" && (
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* pagination */}
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-lg ${
                  currentPage === i + 1
                    ? "bg-indigo-600"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}

      {/* edit model */}
      {editingUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="relative w-[520px] p-8 rounded-2xl 
            bg-white/10 backdrop-blur-2xl 
            border border-white/20 
            shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]
            overflow-hidden">
                      
            {/* close btn */}
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-3 right-3 text-white hover:text-red-400"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-bold mb-6 text-center">
              Edit User
            </h2>

            <div className="space-y-4">
              <FloatingLabelInput
                name="name"
                label="Name"
                value={editingUser.name}
                disabled={editingUser.role === "Student"}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, name: e.target.value })
                }
              />

              <FloatingLabelInput
                name="email"
                label="Email"
                value={editingUser.email}
                disabled={editingUser.role === "Student"}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
              />

              <FloatingLabelInput
                name="username"
                label="Username"
                value={editingUser.username}
                disabled={editingUser.role === "Student"}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    username: e.target.value,
                  })
                }
              />
            </div>

            {/* buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={updateUser}
                disabled={editingUser.role === "Student"}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-40"
              >
                Save
              </button>

              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}