import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetch("http://localhost:8086/tasks/stats")
      .then(res => res.json())
      .then(setStats);
  }, []);

  return (
    <div className="bg-white/10 p-4 rounded-xl mb-4">
      <h3 className="text-lg mb-2">Daily Tasks</h3>
      <p>Total: {stats.total}</p>
      <p>Completed: {stats.completed}</p>
      <p>Pending: {stats.pending}</p>
      <div className="w-full bg-gray-700 rounded h-3 mt-2">
        <div
          className="bg-green-500 h-3 rounded"
          style={{ width: `${stats.progress}%` }}
        />
      </div>
    </div>
  );
}
