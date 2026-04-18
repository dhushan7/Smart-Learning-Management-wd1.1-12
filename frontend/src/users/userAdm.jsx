import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { XMarkIcon } from "@heroicons/react/24/solid";
import Swal from "sweetalert2";

// Floating Input (LIGHT THEME ONLY UPDATED)
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
      className={`peer w-full px-4 py-3 rounded-lg border text-gray-800 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
        disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white border-gray-300"
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
      let fetchedUsers = res.data;

      if (role === "Academic Panel") {
        fetchedUsers = fetchedUsers.filter((u) => u.role === "Student");
      }

      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

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
      background: "#ffffff",
      customClass: {
        popup: "rounded-2xl border shadow-lg",
        title: "text-gray-800 font-semibold",
        htmlContainer: "text-gray-600",
      },
    });
  };

  const deleteUser = async (id) => {
    if (role !== "Admin") {
      Swal.fire("Access Denied", "Only Admin can delete users", "error");
      return;
    }

    const user = users.find((u) => u.id === id);

    if (!user?.email) {
      Swal.fire("Error", "Email not found for this user", "error");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This user will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      background: "#ffffff",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${BASE_URL}/delete`, {
        params: { email: user.email },
      });

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
      background: "#ffffff",
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

  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const getRoleBadge = (role) => {
    switch (role) {
      case "Admin":
        return "bg-red-100 text-red-600";
      case "Student":
        return "bg-green-100 text-green-600";
      default:
        return "bg-blue-100 text-blue-600";
    }
  };

  return (
    <div className="min-h-screen w-[83vw] ml-[17vw] bg-gradient-to-br from-gray-50 to-indigo-50 p-8 text-gray-800">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 mt-20">
        <h1 className="text-3xl font-bold">
          {role === "Academic Panel" ? "Review Students" : "Admin Dashboard"}
        </h1>

        <div className="flex gap-3 items-center">
          {role === "Admin" && (
            <button
              onClick={() => navigate("/admin/create-staff")}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow"
            >
              + Create New User
            </button>
          )}

          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800 w-80 focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          {/* TABLE */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-gray-600">
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
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-4">{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.username}</td>

                    <td>
                      <span className={`px-3 py-1 text-xs rounded-full ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>

                    <td className="flex gap-2 p-2">
                      {role === "Admin" && user.role !== "Student" && (
                        <button
                          onClick={() => setEditingUser(user)}
                          className="px-3 py-1 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm"
                        >
                          Edit
                        </button>
                      )}

                      {role === "Admin" && (
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
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

          {/* PAGINATION */}
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-lg border ${
                  currentPage === i + 1
                    ? "bg-indigo-600 text-white"
                    : "bg-white hover:bg-gray-100 text-gray-700"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}

      {/* MODAL */}
      {editingUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50">
          <div className="w-[520px] p-8 rounded-2xl bg-white border shadow-xl">

            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
              Edit User
            </h2>

            <div className="space-y-4">
              <FloatingLabelInput
                name="name"
                label="Name"
                value={editingUser.name}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, name: e.target.value })
                }
              />

              <FloatingLabelInput
                name="email"
                label="Email"
                value={editingUser.email}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
              />

              <FloatingLabelInput
                name="username"
                label="Username"
                value={editingUser.username}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, username: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={updateUser}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
              >
                Save
              </button>

              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
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