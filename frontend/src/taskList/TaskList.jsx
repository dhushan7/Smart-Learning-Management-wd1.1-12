import React, { useEffect, useState, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import Dashboard from "./Dashboard";
import AddTask from "./AddTask";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editTask, setEditTask] = useState(null);

  // NOTIFICATION UI STATE
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifDeleteId, setNotifDeleteId] = useState(null);

  // TOAST
  const [toast, setToast] = useState(null);
  const [toastType, setToastType] = useState("success");
  const [fade, setFade] = useState(false);

  // trigger re-render for countdown
  const [, setTick] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));
  const email = user?.email;

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

  // FETCH DATA
  const fetchAll = useCallback(async () => {
    if (!email) return;

    try {
      const t = await fetch(`http://localhost:8086/tasks?email=${email}`).then(r => r.json());
      const n = await fetch(`http://localhost:8086/tasks/notifications?email=${email}`).then(r => r.json());

      setTasks(Array.isArray(t) ? t : []);
      setNotifications(Array.isArray(n) ? n : []);
    } catch {
      showToast("Failed to load data", "error");
    }
  }, [email]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // real-time WebSocket
  useEffect(() => {
    if (!email) return;

    const socket = new SockJS("http://localhost:8086/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/notifications/${email}`, (message) => {
        const newNotif = JSON.parse(message.body);

        setNotifications(prev => [newNotif, ...prev]);

        playNotificationSound(); // 🔊 sound
        showToast(`⏰ ${newNotif.title} is due soon!`, "success"); // 📢 popup
      });
    };

    client.activate();

    return () => client.deactivate();
  }, [email]);

  // countdown auto refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // TASK ACTIONS
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

      fetchAll(); // refresh notifications

      showToast("Task completed 🎉", "complete");
    } catch {
      showToast("Failed to complete task", "error");
    }
  };

  const deleteTask = async () => {
    if (!deleteId) return;

    try {
      await fetch(`http://localhost:8086/tasks/${deleteId}`, {
        method: "DELETE",
      });

      setTasks(prev => prev.filter(t => t?.id !== deleteId));
      setDeleteId(null);

      fetchAll(); // refresh notifications

      showToast("Task deleted 🗑️", "delete");
    } catch {
      showToast("Delete failed", "error");
    }
  };

  // NOTIFICATION ACTIONS
  const markAsRead = async (id, currentReadState) => {
    if (currentReadState) return;

    try {
      await fetch(`http://localhost:8086/tasks/${id}/readNotification`, {
        method: "PUT",
      });

      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, notificationRead: true } : n
        )
      );
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const deleteNotification = async () => {
    if (!notifDeleteId) return;

    try {
      await fetch(`http://localhost:8086/tasks/${notifDeleteId}/dismissNotification`, {
        method: "PUT",
      });

      setNotifications(prev =>
        prev.filter(n => n.id !== notifDeleteId)
      );

      setNotifDeleteId(null);
      showToast("Notification removed 🗑️", "delete");
    } catch {
      showToast("Failed to remove notification", "error");
    }
  };

  //Notification sound
  const playNotificationSound = () => {
    const audio = new Audio("/sounds/notify.mp3");
    audio.play().catch(() => {});
  };

  // countdown helper
  const getTimeLeft = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;

    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff / (1000 * 60)) % 60);

    return `${hours}h ${mins}m left`;
  };

  const unreadCount = notifications.filter(n => !n.notificationRead).length;

  return (
    <div className="bg-gradient-to-br from-blue-100 to-purple-100 min-h-screen p-6 font-sans relative">

      {/* NOTIFICATION */}
      <div className="fixed top-20 right-4 z-50">
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-3 rounded-full shadow-xl hover:scale-105 transition relative hover:bg-white"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9">
              </path>
            </svg>

            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {/* DROPDOWN */}
          {showNotifMenu && (
            <div className="absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-2xl border">
              <div className="px-4 py-3 border-b flex justify-between">
                <h3 className="font-bold">Notifications</h3>
                <span className="text-xs text-gray-500">{notifications.length}</span>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-gray-500">No notifications</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id, n.notificationRead)}
                      className={`p-3 flex justify-between items-center border-b cursor-pointer
                      ${n.notificationRead ? "opacity-70" : "bg-blue-50 font-semibold"}`}
                    >
                      <span>{n.title} is due soon!</span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setNotifDeleteId(n.id);
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-700 ${fade ? "opacity-0 -translate-y-6 scale-95" : "opacity-100"}`}>
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

      {/* ADD BUTTON */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:scale-105 transition"
        >
          + Add Task
        </button>
      </div>

      {/* ADD / EDIT MODAL */}
      {(showAddModal || editTask) && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <AddTask
            closeModal={() => {
              setShowAddModal(false);
              setEditTask(null);
            }}
            isEdit={!!editTask}
            editTask={editTask}
            userEmail={email}
            onTaskAdded={(savedTask) => {
              setTasks(prev => prev.map(t => t.id === savedTask.id ? savedTask : t));

              if (!editTask) {
                setTasks(prev => [...prev, savedTask]);
              }

              setEditTask(null);
              setShowAddModal(false);

              fetchAll(); // refresh notifications

              showToast(editTask ? "Task updated ✏️" : "Task added ✨", "success");
            }}
          />
        </div>
      )}

      {/* TASK DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl text-center shadow-lg">
            <h2 className="text-lg font-semibold mb-3">Delete Task?</h2>
            <p className="mb-4 text-gray-600">This cannot be undone.</p>

            <div className="flex justify-center gap-4">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 bg-gray-300 rounded">
                Cancel
              </button>
              <button onClick={deleteTask} className="px-4 py-2 bg-red-500 text-white rounded">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION DELETE MODAL */}
      {notifDeleteId && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl text-center shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-3">Remove Notification?</h2>
            <p className="mb-4 text-gray-600 text-sm">This will remove the alert only.</p>

            <div className="flex justify-center gap-4">
              <button onClick={() => setNotifDeleteId(null)} className="px-4 py-2 bg-gray-200 rounded">
                Cancel
              </button>
              <button onClick={deleteNotification} className="px-4 py-2 bg-red-500 text-white rounded">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TASK LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map(t => (
          <div key={t.id} className={`p-6 rounded-2xl shadow-lg ${t.completed ? "bg-gray-200" : "bg-white"}`}>
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold">{t.title}</h3>
                <p className="text-sm text-gray-500">
                  {t.priority} • {t.dueDate}
                </p>

                {/* countdown timer */}
                <p className="text-xs mt-1 text-orange-600 font-medium">
                  ⏱ {getTimeLeft(t.dueDate)}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-2">
                  {!t.completed && (
                    <button
                      onClick={() => completeTask(t.id)}
                      className="text-green-600 hover:scale-110"
                    >
                      ✓
                    </button>
                  )}

                  <button
                    onClick={() => setDeleteId(t.id)}
                    className="text-red-500 hover:scale-110"
                  >
                    ✕
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (t.completed) return;
                    setEditTask(t);
                    setShowAddModal(true);
                  }}
                  disabled={t.completed}
                  className={`text-blue-500 ${t.completed ? "opacity-40 cursor-not-allowed" : "hover:underline"}`}
                >
                  ✎ Edit
                </button>
              </div>
            </div>

            {t.completed && (
              <p className="text-green-600 mt-3 font-semibold">
                Completed ✅
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}