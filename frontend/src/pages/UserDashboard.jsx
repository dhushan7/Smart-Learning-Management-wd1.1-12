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
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import CommunityChatbot from "../pages/CommunityChatbot";

export default function Dashboard() {
  const role = localStorage.getItem("role");

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-xl font-bold">Please login first</h1>
      </div>
    );
  }

  const isStudent = role === "Student";
  const isAdminOrPanel = role === "Admin" || role === "Academic Panel";
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-gray-50 flex justify-center p-8 font-sans">

      {/* STUDENT */}
      {isStudent && (
        <div className="w-full mt-40 max-w-6xl">
          <header className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Student Dashboard
            </h1>
            <p className="text-gray-600">
              Here’s a quick overview of your system.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            <Link to="/resources">
              <DashboardCard
                title="Resources"
                icon={<BookOpenIcon className="h-12 w-12 text-indigo-500" />}
              />
            </Link>
            <Link to="/tasks">
              <DashboardCard title="My Tasks" icon={<ClipboardDocumentListIcon className="h-12 w-12 text-green-500" />} />
            </Link>
            <Link to="/reviews">
              <DashboardCard title="Review" icon={<StarIcon className="h-12 w-12 text-purple-500" />} />
            </Link>
            <Link to="/quiz-bank">
              <DashboardCard title="Quizzes" icon={<AcademicCapIcon className="h-12 w-12 text-pink-500" />} />
            </Link>
            <Link to="/sessions">
              <DashboardCard title="Study Sessions" icon={<StarIcon className="h-12 w-12 text-yellow-500" />} />
            </Link>        
          </div>
        </div>
      )}

      {/* ADMIN + ACADEMIC PANEL */}
      {isAdminOrPanel && (
        <div className="w-full mt-40 max-w-6xl ml-0 md:ml-[17vw]">

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
                <Link to="/admin/users">
                  <DashboardCard title="Manage Users" icon={<UserGroupIcon className="h-12 w-12 text-red-500" />} />
                </Link>
                <Link to="/admin/reports">
                <DashboardCard title="Reports" icon={<DocumentChartBarIcon className="h-12 w-12 text-blue-500" />} />
                </Link>
                <Link to="/admin/credits">
                <DashboardCard title="Credits" icon={<TrophyIcon className="h-12 w-12 text-indigo-500" />} />
                </Link>
              </>
            )}

            {role === "Academic Panel" && (
              <>
              <Link to="/admin/users">
                <DashboardCard title="Review Students" icon={<UserGroupIcon className="h-12 w-12 text-blue-500" />} />
              </Link>
              <Link to="/admin/resources">
                <DashboardCard title="All Resources" icon={<BookOpenIcon className="h-12 w-12 text-indigo-500" />} />
              </Link>
              <Link to="/admin/sessions">
                <DashboardCard title="My Resources" icon={<BookOpenIcon className="h-12 w-12 text-indigo-500" />} />
              </Link>
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
    <div className="bg-white p-6 rounded-3xl shadow-md hover:shadow-xl transition cursor-pointer w-64 flex flex-col items-center justify-center text-center">
      {icon}
      <h2 className="mt-4 text-2xl font-semibold text-gray-800">{title}</h2>
    </div>
  );
}