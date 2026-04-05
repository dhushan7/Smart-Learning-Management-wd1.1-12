import { useCallback, useEffect, useState } from "react";

const API_BASE = "http://localhost:8080/api";
const CURRENT_USER = "STU-2026-001";

export default function CreditAwardingPage() {
  const [totalCredits, setTotalCredits] = useState(0);
  const [history, setHistory] = useState([]);
  const [backendStatus, setBackendStatus] = useState("Connecting...");

  const loadData = useCallback(async () => {
    try {
      const [credRes, histRes] = await Promise.all([
        fetch(`${API_BASE}/credits/student/${CURRENT_USER}`),
        fetch(`${API_BASE}/credits/history/${CURRENT_USER}`),
      ]);
      if (credRes.ok) { const d = await credRes.json(); setTotalCredits(d.totalCredits ?? 0); }
      if (histRes.ok) setHistory(await histRes.json());
      setBackendStatus("Online: API connected");
    } catch { setBackendStatus("Offline: backend unavailable"); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <main className="mx-auto mt-6 max-w-6xl px-4 pb-10 text-slate-800">
      <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-lg">
        {/* Header */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl font-bold text-emerald-800">My Credits</h2>
            <p className="text-sm text-slate-500">Your total credits and earning history — {CURRENT_USER}</p>
          </div>
          <p className="rounded-md bg-emerald-50 px-3 py-1 text-xs text-emerald-800">{backendStatus}</p>
        </div>

        {/* Total Credits */}
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Total Credits</p>
          <p className="font-display text-6xl font-extrabold text-emerald-900">{totalCredits}</p>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-emerald-200">
            <div className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(totalCredits, 100)}%` }} />
          </div>
          <p className="mt-1 text-xs text-emerald-600">
            💡 Download a resource to earn +2 credits automatically.
          </p>
        </div>

        {/* Credit History */}
        <h3 className="mb-3 font-bold text-emerald-800">Credit History</h3>
        {history.length === 0 ? (
          <p className="rounded-xl border border-slate-100 bg-slate-50 py-10 text-center text-sm text-slate-400">
            No credits earned yet. Start by completing resources!
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50 text-xs uppercase tracking-wide text-emerald-700">
                <tr>
                  <th className="px-4 py-3 text-left">Activity</th>
                  <th className="px-4 py-3 text-center">Credits</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-center">Type</th>
                </tr>
              </thead>
              <tbody>
                {history.map((tx, i) => (
                  <tr key={tx.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="px-4 py-2 font-medium">{tx.activity}</td>
                    <td className="px-4 py-2 text-center font-bold text-emerald-600">+{tx.credits}</td>
                    <td className="px-4 py-2 text-xs text-slate-400">{formatDate(tx.awardedAt)}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        tx.type === "AUTO_DOWNLOAD" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {tx.type === "AUTO_DOWNLOAD" ? "Auto" : "Manual"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
