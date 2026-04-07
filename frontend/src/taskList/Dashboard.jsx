import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({});

  const user = JSON.parse(localStorage.getItem("user"));
  const email = user?.email;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const email = user?.email;

    fetch(`http://localhost:8086/tasks/stats?email=${email}`)
      .then(res => res.json())
      .then(setStats);
  }, []);

  const completed = stats.completed || 0;
  const pending = stats.pending || 0;
  const total = stats.total || 0;

  const data = [
    { name: "Completed", value: completed },
    { name: "Pending", value: pending },
  ];

  const COLORS = ["#22c55e", "#f59e0b"]; // green, amber

  const progress = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="mb-6 p-6 rounded-2xl shadow-xl text-white
      bg-gradient-to-br from-blue-100 to-purple-100
      border border-white/30 backdrop-blur mt-10">

      {/* Title */}
      <h2 className="text-2xl font-bold mb-5 text-indigo-900 text-center">
        Task Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* STATS */}
        <div className="grid grid-cols-1 gap-4">

          <div className="bg-white/70 text-indigo-900 p-4 rounded-xl shadow">
            <p className="text-sm">Total Tasks</p>
            <p className="text-2xl font-bold">{total}</p>
          </div>

          <div className="bg-white/70 text-indigo-900 p-4 rounded-xl shadow">
            <p className="text-sm">Completed</p>
            <p className="text-2xl font-bold text-green-600">{completed}</p>
          </div>

          <div className="bg-white/70 text-indigo-900 p-4 rounded-xl shadow">
            <p className="text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{pending}</p>
          </div>

          {/* Progress bar */}
          <div className="bg-white/70 p-4 rounded-xl shadow">
            <div className="flex justify-between text-sm mb-1 text-indigo-900">
              <span>Completion</span>
              <span>{progress}%</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-green-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

        </div>

        {/* DONUT CHART */}
        <div className="flex items-center justify-center bg-white/70 rounded-xl shadow p-4">

          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

        </div>

      </div>
    </div>
  );
}