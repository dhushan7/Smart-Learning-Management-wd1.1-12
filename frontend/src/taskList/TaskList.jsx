import React, { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import AddTask from "./AddTask";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchAll = async () => {
    try {
      const t = await fetch("http://localhost:8086/tasks").then(r => r.json());
      const n = await fetch("http://localhost:8086/tasks/notifications").then(r => r.json());
      setTasks(t);
      setNotifications(n);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const completeTask = async (id) => {
    await fetch(`http://localhost:8086/tasks/${id}/complete`, { method: "PUT" });
    fetchAll();
  };

  return (
    <div className="bg-gradient-to-br from-indigo-100 to-purple-200 min-h-screen p-6 font-sans">
      {/* Dashboard */}
      <Dashboard />

      {/* Add Task Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:scale-105 transform transition-all duration-300"
        >
          + Add Task
        </button>
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <AddTask
            closeModal={() => setShowAddModal(false)}
            onTaskAdded={() => {
              fetchAll();
              setShowAddModal(false);
            }}
          />
        </div>
      )}

      {/* Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map(t => (
          <div
            key={t.id}
            className={`p-6 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 ${
              t.completed ? "bg-gray-200/70" : "bg-white/70 backdrop-blur-md"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{t.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{t.priority} | {t.dueDate}</p>
              </div>

              {!t.completed && (
                <button
                  onClick={() => completeTask(t.id)}
                  className="bg-green-400 hover:bg-green-500 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300"
                >
                  Done
                </button>
              )}
            </div>

            {t.completed && (
              <div className="mt-4 text-green-700 font-semibold">Completed ✅</div>
            )}
          </div>
        ))}
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Notifications</h2>
          <ul className="space-y-2">
            {notifications.map(n => (
              <li key={n.id} className="p-4 bg-white/70 backdrop-blur-md rounded-xl shadow hover:shadow-lg transition">
                {n.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}