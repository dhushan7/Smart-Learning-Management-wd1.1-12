import React from "react";
import {
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  AcademicCapIcon,
  StarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  DocumentChartBarIcon,
} from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const role = localStorage.getItem("role");

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-xl font-bold">Please login first</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-8 font-sans">
  {role === "Student" && (
    <div className="w-full max-w-6xl">

        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {role} Dashboard
          </h1>
          <p className="text-gray-600">
            Here’s a quick overview of your system.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">

          
            <>
              <DashboardCard title="Resources" icon={<BookOpenIcon className="h-12 w-24 text-indigo-500" />} />
              <DashboardCard title="My Tasks" icon={<ClipboardDocumentListIcon className="h-12 w-24 text-green-500" />} />
              <DashboardCard title="Progress" icon={<ChartBarIcon className="h-12 w-24 text-purple-500" />} />
              <DashboardCard title="Quizzes" icon={<AcademicCapIcon className="h-12 w-24 text-pink-500" />} />
              <DashboardCard title="My Ratings" icon={<StarIcon className="h-12 w-24 text-yellow-500" />} />
            </>
          

        </div>
      </div>
  )}

  {role === "Admin" || role === "Academic Panel" && (
      <div className="w-[83vw] ml-[17vw] max-w-6xl">

        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {role} Dashboard
          </h1>
          <p className="text-gray-600">
            Here’s a quick overview of your system.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {role === "Admin" && (
            <>
              <Link to="/admin/users"><DashboardCard title="Manage Users" icon={<UserGroupIcon className="h-12 w-24 text-red-500" />} /></Link>
              <DashboardCard title="System Settings" icon={<Cog6ToothIcon className="h-12 w-24 text-gray-500" />} />
              <DashboardCard title="Reports" icon={<DocumentChartBarIcon className="h-12 w-24 text-blue-500" />} />
              <DashboardCard title="Resources" icon={<BookOpenIcon className="h-12 w-24 text-indigo-500" />} />
            </>
          )}

          {role === "Academic Panel" && (
            <>
              <DashboardCard title="Review Students" icon={<UserGroupIcon className="h-12 w-24 text-blue-500" />} />
              <DashboardCard title="Manage Courses" icon={<BookOpenIcon className="h-12 w-24 text-indigo-500" />} />
              <DashboardCard title="Analytics" icon={<ChartBarIcon className="h-12 w-24 text-purple-500" />} />
              <DashboardCard title="All Resources" icon={<BookOpenIcon className="h-12 w-24 text-indigo-500" />} />
              <DashboardCard title="My Resources" icon={<BookOpenIcon className="h-12 w-24 text-indigo-500" />} />
            </>
          )}

        </div>
      </div>
      )}
    </div>
  );
}

function DashboardCard({ title, icon }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-md hover:shadow-xl transition cursor-pointer w-64 text-center">
      {icon}
      <h2 className="mt-4 text-2xl font-semibold text-gray-800">{title}</h2>
    </div>
  );
}