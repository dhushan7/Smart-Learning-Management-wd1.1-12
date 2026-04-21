import React from "react";

export default function FloatingInput({
  name,
  type = "text",
  label,
  value,
  onChange,
  required,
}) {
  return (
    <div className="relative w-full">
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        placeholder=" "
        required={required}
        className="peer w-full px-4 py-3 rounded-lg border border-gray-400 text-black placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <label
        htmlFor={name}
        className={`absolute left-4 text-gray-500 transition-all
        peer-placeholder-shown:top-3.5
        peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-600
        ${value ? "top-1 text-sm text-blue-600" : ""}`}
      >
        {label}
      </label>
    </div>
  );
}