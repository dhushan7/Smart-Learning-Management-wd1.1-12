import React from "react";

export default function About() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="max-w-3xl bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-4">About Us</h1>
        <p className="text-gray-600 leading-relaxed">
          Welcome to our platform! We are dedicated to helping students, admins,
          and academic staff manage learning activities efficiently.  
          Our system provides task management, resources, analytics, and more
          in one place.
        </p>
      </div>
    </div>
  );
}