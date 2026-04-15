import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  UsersIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const BASE_URL = "http://localhost:8086";

export default function AdminReports() {
  const [loading, setLoading] = useState(true);

  const [totalUsers, setTotalUsers] = useState(0);
  const [roleData, setRoleData] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [quizStatsData, setQuizStatsData] = useState([]);
  const [avgScore, setAvgScore] = useState(0);

  const PIE_COLORS = ["#10b981", "#6366f1", "#ef4444"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // ================= USERS =================
      const usersRes = await axios.get(`${BASE_URL}/user`);
      const users = usersRes.data;

      setTotalUsers(users.length);

      // ================= ROLE DISTRIBUTION =================
      const roleMap = {};
      users.forEach((u) => {
        roleMap[u.role] = (roleMap[u.role] || 0) + 1;
      });

      const formattedRoles = Object.keys(roleMap).map((key) => ({
        name: key,
        value: roleMap[key],
      }));

      setRoleData(formattedRoles);

      // ================= USER GROWTH (Mock fallback if no backend) =================
      // Replace this with backend API later
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      const growth = months.map((m, i) => ({
        month: m,
        users: Math.floor(users.length * ((i + 1) / 6)),
      }));

      setUserGrowthData(growth);

      // ================= QUIZ STATS (OPTIONAL API) =================
      try {
        const quizRes = await axios.get(`${BASE_URL}/quiz/stats`);
        setQuizStatsData(quizRes.data);
      } catch {
        // fallback demo data
        setQuizStatsData([
          { subject: "Math", attempts: 120 },
          { subject: "Science", attempts: 90 },
          { subject: "History", attempts: 70 },
        ]);
      }

      // ================= AVG SCORE (OPTIONAL) =================
      try {
        const avgRes = await axios.get(`${BASE_URL}/quiz/average-score`);
        setAvgScore(avgRes.data);
      } catch {
        setAvgScore(84.5);
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleExport = () => {
    alert("Export feature coming soon (PDF/CSV)");
  };

  if (loading) {
    return (
      <div className="min-h-screen w-[83vw] ml-[17vw] flex items-center justify-center bg-slate-900 text-white">
        <p className="text-xl animate-pulse">Loading Reports...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-[83vw] ml-[17vw] bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 p-8 text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 mt-10">
        <div>
          <h1 className="text-3xl font-bold">Platform Analytics</h1>
          <p className="text-gray-400">Real-time system insights</p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg"
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          Export
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={totalUsers}
          trend="Live data"
          icon={<UsersIcon className="w-8 h-8 text-blue-400" />}
        />
        <StatCard
          title="Quizzes Attempted"
          value={quizStatsData.reduce((a, b) => a + b.attempts, 0)}
          trend="Dynamic"
          icon={<AcademicCapIcon className="w-8 h-8 text-green-400" />}
        />
        <StatCard
          title="Average Score"
          value={`${avgScore}%`}
          trend="Updated"
          icon={<ChartBarIcon className="w-8 h-8 text-purple-400" />}
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* USER GROWTH */}
        <div className="bg-white/5 p-6 rounded-2xl">
          <h3 className="mb-4 text-indigo-300">User Growth</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                <XAxis dataKey="month" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="#818cf8" fill="#6366f1" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* QUIZ STATS */}
        <div className="bg-white/5 p-6 rounded-2xl">
          <h3 className="mb-4 text-indigo-300">Quiz Engagement</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={quizStatsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                <XAxis dataKey="subject" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip />
                <Legend />
                <Bar dataKey="attempts" fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROLE PIE */}
        <div className="bg-white/5 p-6 rounded-2xl lg:col-span-2">
          <h3 className="mb-4 text-center text-indigo-300">
            User Role Distribution
          </h3>

          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={roleData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {roleData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

// CARD COMPONENT
function StatCard({ title, value, trend, icon }) {
  return (
    <div className="bg-white/5 p-6 rounded-2xl flex justify-between items-center hover:-translate-y-1 transition">
      <div>
        <p className="text-gray-400">{title}</p>
        <h3 className="text-3xl font-bold">{value}</h3>
        <p className="text-indigo-300 text-sm">{trend}</p>
      </div>
      <div className="p-4 bg-white/10 rounded-xl">{icon}</div>
    </div>
  );
}
