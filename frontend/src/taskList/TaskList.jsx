import React, { useEffect, useState, useCallback } from "react";
import Dashboard from "./Dashboard";
import AddTask from "./AddTask";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // ✏️ EDIT STATE
  const [editTask, setEditTask] = useState(null);

  // 🔥 Toast state
  const [toast, setToast] = useState(null);
  const [toastType, setToastType] = useState("success");
  const [fade, setFade] = useState(false);

  const showToast = (message, type = "success") => {
    setToast(message);
    setToastType(type);
    setFade(false);

    setTimeout(() => setFade(true), 2000);
    setTimeout(() => {
      setToast(null);
      setFade(false);
    }, 2500);
  };

  // ✅ Fetch data
  const fetchAll = useCallback(async () => {
    try {
      const t = await fetch("http://localhost:8086/tasks").then(r => r.json());
      const n = await fetch("http://localhost:8086/tasks/notifications").then(r => r.json());

      setTasks(Array.isArray(t) ? t.filter(x => x?.id) : []);
      setNotifications(Array.isArray(n) ? n : []);
    } catch {
      showToast("Failed to load data", "error");
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ✅ COMPLETE TASK
  const completeTask = async (id) => {
    try {
      await fetch(`http://localhost:8086/tasks/${id}/complete`, {
        method: "PUT",
      });

      setTasks(prev =>
        prev.map(t =>
          t?.id === id ? { ...t, completed: true } : t
        )
      );

      showToast("Task completed 🎉", "complete");
    } catch {
      showToast("Failed to complete task", "error");
    }
  };

  // ❌ DELETE TASK
  const deleteTask = async () => {
    if (!deleteId) return;

    try {
      await fetch(`http://localhost:8086/tasks/${deleteId}`, {
        method: "DELETE",
      });

      setTasks(prev => prev.filter(t => t?.id !== deleteId));
      setDeleteId(null);

      showToast("Task deleted 🗑️", "delete");
    } catch {
      showToast("Delete failed", "error");
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-100 to-purple-200 min-h-screen p-6 font-sans">

      {/* 🔔 TOAST */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-700
          ${fade ? "opacity-0 -translate-y-6 scale-95" : "opacity-100"}`}
        >
          <div className={`px-6 py-3 rounded-2xl shadow-xl text-white flex items-center gap-2
            ${toastType === "complete" && "bg-green-500"}
            ${toastType === "delete" && "bg-red-500"}
            ${toastType === "success" && "bg-orange-500"}
            ${toastType === "error" && "bg-red-600"}
          `}>
            <span>
              {toastType === "complete" && "✅"}
              {toastType === "delete" && "🗑️"}
              {toastType === "success" && "➕"}
              {toastType === "error" && "❌"}
            </span>
            {toast}
          </div>
        </div>
      )}

      <Dashboard />

      {/* ➕ ADD BUTTON */}
      <div className="flex justify-end mb-6 gap-3">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:scale-105 transition"
        >
          + Add Task
        </button>
      </div>

      {/* 🧾 ADD / EDIT MODAL */}
      {(showAddModal || editTask) && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <AddTask
            closeModal={() => {
              setShowAddModal(false);
              setEditTask(null);
            }}
            isEdit={!!editTask}
            editTask={editTask}
            onTaskAdded={(savedTask) => {
              setTasks(prev =>
                prev.map(t =>
                  t.id === savedTask.id ? savedTask : t
                )
              );

              setEditTask(null);
              setShowAddModal(false);

              showToast(
                editTask ? "Task updated ✏️" : "Task added ✨",
                "success"
              );
            }}
          />
        </div>
      )}

      {/* ❌ DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl text-center shadow-lg">
            <h2 className="text-lg font-semibold mb-3">Delete Task?</h2>
            <p className="mb-4 text-gray-600">This cannot be undone.</p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={deleteTask}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📋 TASK LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map(t => (
          <div
            key={t.id}
            className={`p-6 rounded-2xl shadow-lg ${t.completed ? "bg-gray-200" : "bg-white"}`}
          >
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold">{t.title}</h3>
                <p className="text-sm text-gray-500">
                  {t.priority} • {t.dueDate}
                </p>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col items-end gap-2">

                {/* TOP ROW: COMPLETE + DELETE */}
                <div className="flex gap-2">

                  {/* COMPLETE */}
                  {!t.completed && (
                    <button
                      onClick={() => completeTask(t.id)}
                      className="text-green-600"
                      title="Complete"
                    >
                      ✓
                    </button>
                  )}

                  {/* DELETE */}
                  <button
                    onClick={() => setDeleteId(t.id)}
                    className="text-red-500"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>

                {/* BOTTOM ROW: EDIT (disabled if completed) */}
                <button
                  onClick={() => {
                    if (t.completed) return;
                    setEditTask(t);
                    setShowAddModal(true);
                  }}
                  disabled={t.completed}
                  className={`text-blue-500 ${
                    t.completed ? "opacity-40 cursor-not-allowed" : "hover:underline"
                  }`}
                  title={t.completed ? "Cannot edit completed task" : "Edit"}
                >
                  ✎ Edit
                </button>

              </div>
            </div>

            {t.completed && (
              <p className="text-green-600 mt-3">Completed ✅</p>
            )}
          </div>
        ))}
      </div>

      {/* 🔔 NOTIFICATIONS */}
      {notifications.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-3">Notifications</h2>
          {notifications.map(n => (
            <div key={n.id} className="bg-white p-3 rounded mb-2 shadow">
              {n.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}