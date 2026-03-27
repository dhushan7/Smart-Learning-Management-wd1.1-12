import React, { useEffect, useState } from "react";
import axios from "axios";
import { XMarkIcon } from "@heroicons/react/24/solid";

// ✅ Floating Label Input (same style everywhere)
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
      className="peer w-full px-4 py-3 sm:py-4 rounded-lg border border-gray-400 text-black placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800"
    />
    <label
      htmlFor={name}
      className={`absolute left-4 text-gray-500 text-base transition-all
        peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
        peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-800
        ${value ? "top-1 text-sm text-blue-800" : ""}`}
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
  const usersPerPage = 5;

  const [editingUser, setEditingUser] = useState(null);

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
      console.error("FETCH ERROR:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.username.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [search, users]);

  const deleteUser = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/${id}`);
      fetchUsers();
    } catch (err) {
      console.error("DELETE ERROR:", err);
    }
  };

  const updateUser = async () => {
    try {
      await axios.put(`${BASE_URL}/${editingUser.id}`, editingUser);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error("UPDATE ERROR:", err);
    }
  };

  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="bg-gray-700 min-h-screen p-6 text-gray-100 font-sans">
      <h2 className="text-3xl text-center font-bold mb-6">Active Users</h2>

      {/* Search */}
      <div className="flex justify-end mb-6 mr-10">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg w-80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-800"
        />
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <thead className="bg-gray-700 text-gray-300">
                <tr>
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Username</th>
                  <th className="py-3 px-4 text-left">Password</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="bg-gray-800 hover:bg-gray-700 transition-colors"
                  >
                    <td className="py-3 px-4">{user.id}</td>
                    <td className="py-3 px-4">{user.name}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">{user.username}</td>
                    <td className="py-3 px-4">********</td>
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="bg-blue-800 hover:bg-blue-900 px-3 py-1 rounded-lg shadow transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg shadow transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-lg ${
                  currentPage === i + 1
                    ? "bg-blue-800 text-white shadow-lg"
                    : "bg-gray-700 hover:bg-gray-600"
                } transition`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}

      {/* ✅ Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="w-[500px] p-8 rounded-2xl backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl relative">

            {/* Close Button */}
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-3 right-3 text-white hover:text-red-400"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Title */}
            <h3 className="text-2xl font-bold text-white text-center mb-6">
              Edit User
            </h3>

            {/* Form */}
            <div className="space-y-4">

              <FloatingLabelInput
                name="name"
                label="Full Name"
                value={editingUser.name}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, name: e.target.value })
                }
                required
              />

              <FloatingLabelInput
                name="email"
                type="email"
                label="Email"
                value={editingUser.email}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
                required
              />

              <FloatingLabelInput
                name="username"
                label="Username"
                value={editingUser.username}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    username: e.target.value,
                  })
                }
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={updateUser}
                className="bg-blue-800 hover:bg-blue-900 px-4 py-2 rounded-lg shadow transition text-white"
              >
                Save
              </button>
              <button
                onClick={() => setEditingUser(null)}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg shadow transition text-white"
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