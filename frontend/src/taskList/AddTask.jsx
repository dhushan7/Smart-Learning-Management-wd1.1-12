import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

/* ---------------- FLOATING INPUT ---------------- */
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

/* ---------------- FLOATING SELECT ---------------- */
const FloatingLabelSelect = ({ name, label, options, value, onChange }) => (
    <div className="relative w-full mt-2">
        <select
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            className="peer w-full px-4 py-3 sm:py-4 rounded-lg border border-gray-400 text-black bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 appearance-none"
        >
            <option value="" disabled hidden></option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>

        <label
            className={`absolute left-3 transition-all pointer-events-none
        ${value
                ? "-top-2.5 text-sm text-purple-700 bg-white px-1"
                : "top-3.5 text-base text-gray-600"
            }`}
        >
            {label}
        </label>
    </div>
);

/* ---------------- DATE INPUT ---------------- */
const DueDateInput = ({ value, onChange }) => {
    const today = new Date().toISOString().split("T")[0];

    return (
        <div className="relative w-full">
            <input
                type="date"
                name="dueDate"
                value={value}
                onChange={onChange}
                min={today}
                className="peer w-full px-4 pt-6 pb-2 rounded-lg border border-gray-400"
            />
            <label className="absolute left-4 text-gray-400">
                Due Date *
            </label>
        </div>
    );
};

/* ---------------- MAIN COMPONENT ---------------- */
export default function AddTask({ closeModal, onTaskAdded, editTask, isEdit }) {

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

    /* ---------------- PREFILL FOR EDIT ---------------- */
    useEffect(() => {
        if (editTask) {
            setFormData({
                title: editTask.title || "",
                dueDate: editTask.dueDate || "",
                priority: editTask.priority || "",
                category: editTask.category || "",
                completed: editTask.completed || false,
            });
        }
    }, [editTask]);

    /* ---------------- INPUT CHANGE ---------------- */
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    /* ---------------- AI GENERATE ---------------- */
    const handleAIGenerate = async () => {
        setLoadingAI(true);
        setError("");

        try {
            const res = await fetch("http://localhost:8086/tasks/suggest", {
                method: "POST",
            });

            const data = await res.json();

            setFormData(prev => ({
                ...prev,
                title: data.title || "",
                dueDate: data.dueDate || "",
                priority: data.priority || "MEDIUM",
                category: data.category || "",
            }));
        } catch {
            setError("AI generation failed");
        } finally {
            setLoadingAI(false);
        }
    };

    /* ---------------- SUBMIT (CREATE + UPDATE) ---------------- */
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const today = new Date().setHours(0, 0, 0, 0);
        const selected = new Date(formData.dueDate);

        if (!formData.title) return setError("Title required");
        if (!formData.dueDate) return setError("Due date required");
        if (selected < today) return setError("Due date cannot be past");
        if (!formData.priority) return setError("Priority required");
        if (!formData.category) return setError("Category required");

        const url = isEdit
            ? `http://localhost:8086/tasks/${editTask.id}`
            : "http://localhost:8086/tasks";

        const method = isEdit ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    autoGenerated: false,
                    suggestionSource: "AI",
                    notified: false,
                }),
            });

            if (!res.ok) {
                setError("Server error");
                return;
            }

            const savedTask = await res.json();

            setSuccess(isEdit ? "Task updated successfully!" : "Task added successfully!");

            if (onTaskAdded) onTaskAdded(savedTask);

            setTimeout(() => closeModal(), 500);

        } catch {
            setError("Server error");
        }
    };

    /* ---------------- UI ---------------- */
    return (
        <div className="w-full max-w-lg p-6 rounded-2xl bg-white/20 backdrop-blur-xl border shadow-xl relative">

            {/* CLOSE */}
            <button onClick={closeModal} className="absolute top-3 right-3">
                <XMarkIcon className="w-6 h-6 text-white" />
            </button>

            {/* TITLE */}
            <h2 className="text-2xl font-bold text-center text-white mb-4">
                {isEdit ? "Update Task" : "Add Task"}
            </h2>

            {/* AI BUTTON */}
            <button
                type="button"
                onClick={handleAIGenerate}
                disabled={loadingAI}
                className="w-full mb-4 py-2 rounded-lg bg-purple-500 text-white font-semibold"
            >
                {loadingAI ? "Generating..." : "🤖 Generate Task"}
            </button>

            {/* ERROR / SUCCESS */}
            {error && <p className="text-red-300 text-center">{error}</p>}
            {success && <p className="text-green-300 text-center">{success}</p>}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4 mt-3">

                <FloatingLabelInput
                    name="title"
                    label="Task Title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />

                <DueDateInput
                    value={formData.dueDate}
                    onChange={handleChange}
                />

                <FloatingLabelSelect
                    name="priority"
                    label="Priority"
                    value={formData.priority}
                    onChange={handleChange}
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

                {/* SUBMIT */}
                <button
                    type="submit"
                    className="w-full py-2 rounded-lg bg-white/30 font-semibold"
                >
                    {isEdit ? "Update Task" : "Add Task"}
                </button>

            </form>
        </div>
    );
}