import React from "react";
import {
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  AcademicCapIcon,
  StarIcon,
} from "@heroicons/react/24/solid";

export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-8 font-sans">
      
      <div className="w-full max-w-6xl">

        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back, Madhushan!</h1>
          <p className="text-gray-600">Here’s a quick overview of your activities and progress.</p>
        </header>

        {/* card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          <DashboardCard
            title="My Resources"
            description="Access all your learning materials."
            icon={<BookOpenIcon className="h-12 w-24 text-indigo-500" />}
            bgColor="bg-indigo-100/50"
          />
          <DashboardCard
            title="My Tasks"
            description="Check pending and completed tasks."
            icon={<ClipboardDocumentListIcon className="h-12 w-24 text-green-500" />}
            bgColor="bg-green-100/50"
          />
          <DashboardCard
            title="Progress"
            description="Track your performance over time."
            icon={<ChartBarIcon className="h-12 w-24 text-purple-500" />}
            bgColor="bg-purple-100/50"
          />
          <DashboardCard
            title="Quizzes"
            description="Take quizzes to test your knowledge."
            icon={<AcademicCapIcon className="h-12 w-24 text-pink-500" />}
            bgColor="bg-pink-100/50"
          />
          <DashboardCard
            title="My Ratings"
            description="View feedback and ratings from instructors."
            icon={<StarIcon className="h-12 w-24 text-yellow-500" />}
            bgColor="bg-yellow-100/50"
          />
        </div>
      </div>
    </div>
  );
}

// Dashboard Card
function DashboardCard({ title, description, icon, bgColor }) {
  return (
    <div className={`relative bg-white p-6 rounded-3xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden w-64`}>
      {/* Decorative background */}
      <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full ${bgColor} opacity-50`}></div>
      
      {/* Card content */}
      <div className="relative text-center">
        {icon}
        <h2 className="mt-4 text-2xl font-semibold text-gray-800">{title}</h2>
        <p className="mt-2 text-gray-600">{description}</p>
      </div>
    </div>
  );
}