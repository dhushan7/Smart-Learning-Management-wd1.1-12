import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

// Label Input
const FloatingLabelInput = ({ name, type = "text", label, value, onChange, required }) => (
  <div className="relative w-full">
    <input
      type={type}
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      placeholder=" "
      required={required}
      className="peer w-full px-4 py-3 sm:py-4 rounded-lg border border-gray-400 text-black placeholder-transparent focus:outline-none focus:ring-2 focus:ring-purple-400"
    />
    <label
      htmlFor={name}
      className={`absolute left-4 text-gray-500 text-base transition-all
        peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
        peer-focus:top-1 peer-focus:text-sm peer-focus:text-purple-500
        ${value ? "top-1 text-sm text-purple-500" : ""}`}
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
  </div>
);

// Label Select
const FloatingLabelSelect = ({ name, label, options, value, onChange, required }) => (
  <div className="relative w-full mt-2">
    <select
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      required={required}
      className="peer w-full px-4 py-3 sm:py-4 rounded-lg border border-gray-400 text-black bg-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400 appearance-none transition-all"
    >
      <option value="" disabled hidden></option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="text-black">
          {opt.label}
        </option>
      ))}
    </select>

    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-600">
      <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
      </svg>
    </div>

    <label
      htmlFor={name}
      className={`absolute left-3 px-1 transition-all duration-200 pointer-events-none rounded-md
        peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-purple-700 peer-focus:bg-white/80 peer-focus:backdrop-blur-md
        ${
          value 
            ? "-top-2.5 text-sm text-purple-700 bg-white/80 backdrop-blur-md" 
            : "top-3.5 text-base text-gray-600 bg-transparent backdrop-blur-none"
        }`}
    >
      {label} {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  </div>
);

// Due Date Input
const DueDateInput = ({ value, onChange }) => {
  const today = new Date().toISOString().split("T")[0];
  return (
    <div className="relative w-full">
      <input
        type="date"
        name="dueDate"
        id="dueDate"
        value={value}
        onChange={onChange}
        min={today}
        placeholder=" "
        required
        className="peer w-full px-4 pt-6 pb-2 rounded-lg border border-gray-400 text-black placeholder-transparent focus:outline-none focus:ring-2 focus:ring-purple-400"
      />
      <label
        htmlFor="dueDate"
        className={`absolute left-4 text-gray-400 text-base transition-all
          peer-placeholder-shown:top-6 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base
          peer-focus:top-1 peer-focus:text-sm peer-focus:text-purple-500
          ${value ? "top-1 text-sm text-purple-500" : ""}`}
      >
        Due Date <span className="text-red-500">*</span>
      </label>
    </div>
  );
};

// Main Component
export default function AddTask({ closeModal, onTaskAdded }) {
  const [formData, setFormData] = useState({
    title: "",
    dueDate: "",
    priority: "",
    category: "",
    completed: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAIGenerate = async () => {
    setLoadingAI(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8086/tasks/ai-generate", { method: "POST" });
      const data = await res.json();
      setFormData({
        ...formData,
        title: data.title || "",
        dueDate: data.dueDate || "",
        priority: data.priority || "MEDIUM",
        category: data.category || "",
      });
    } catch (err) {
      setError("AI generation failed");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const today = new Date();
    const selectedDate = new Date(formData.dueDate);

    if (!formData.title) {
      setError("Please enter a task title");
      return;
    }
    if (!formData.dueDate) {
      setError("Please select a due date");
      return;
    }
    if (selectedDate < today.setHours(0, 0, 0, 0)) {
      setError("Due date cannot be in the past");
      return;
    }
    if (!formData.priority) {
      setError("Please select task priority");
      return;
    }
    if (!formData.category) {
      setError("Please enter a category");
      return;
    }

    try {
      const res = await fetch("http://localhost:8086/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          autoGenerated: false,
          suggestionSource: "AI",
          notified: false,
        }),
      });

      if (res.ok) {
        setSuccess("Task added successfully!");
        if (onTaskAdded) onTaskAdded();
        setTimeout(() => closeModal(), 1000);
      } else {
        setError("Server error");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <div className="w-full max-w-lg sm:w-[600px] p-6 sm:p-8 rounded-2xl backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl relative">
      <button
        onClick={closeModal}
        className="absolute top-3 right-3 text-white hover:text-gray-200 transition-colors"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      <h2 className="text-2xl font-bold text-white text-center mb-4">Add Task</h2>

      <button
        type="button"
        onClick={handleAIGenerate}
        disabled={loadingAI}
        className="w-full mb-4 py-2 rounded-lg bg-purple-500/70 hover:bg-purple-600 disabled:bg-purple-400 text-white font-semibold transition"
      >
        {loadingAI ? "Analyzing..." : "🤖 Generate Task"}
      </button>

      {success && <p className="text-green-300 text-center mb-2">{success}</p>}
      {error && <p className="text-red-300 text-center mb-2">{error}</p>}

      <form onSubmit={handleAdd} className="space-y-4 mt-2">
        <FloatingLabelInput
          name="title"
          label="Task Title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <DueDateInput value={formData.dueDate} onChange={handleChange} />

        <FloatingLabelSelect
          name="priority"
          label="Priority"
          value={formData.priority}
          onChange={handleChange}
          required
          options={[
            { value: "LOW", label: "Low" },
            { value: "MEDIUM", label: "Medium" },
            { value: "HIGH", label: "High" },
          ]}
        />

        <FloatingLabelInput
          name="category"
          label="Category"
          value={formData.category}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          className="w-full py-2 mt-4 rounded-lg bg-white/30 hover:bg-white/40 text-black font-semibold transition-colors"
        >
          Add Task
        </button>
      </form>
    </div>
  );
}