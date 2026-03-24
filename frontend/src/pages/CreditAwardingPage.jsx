import { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:8080/api";

export default function CreditAwardingPage() {
  const [resources, setResources] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [backendStatus, setBackendStatus] = useState("Connecting...");
  const [completedIds, setCompletedIds] = useState({});

  const loadData = useCallback(async () => {
    await Promise.all([loadResources(), loadCredits()]);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const sortedResources = useMemo(
    () => [...resources].sort((a, b) => Number(b.id) - Number(a.id)),
    [resources]
  );

  async function loadResources() {
    try {
      const response = await fetch(`${API_BASE}/resources`);
      if (!response.ok) {
        throw new Error("Resource API failed");
      }
      const data = await response.json();
      setResources(data || []);
      setBackendStatus("Online: API connected");
    } catch (error) {
      setResources((prev) => prev);
      setBackendStatus("Offline: using local fallback");
    }
  }

  async function loadCredits() {
    try {
      const response = await fetch(`${API_BASE}/credits`);
      if (!response.ok) {
        throw new Error("Credit API failed");
      }
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setTotalCredits(Number(data[0].totalCredits || 0));
      } else {
        setTotalCredits(0);
      }
    } catch (error) {
      setTotalCredits((prev) => prev);
    }
  }

  async function markAsFinished(resourceId) {
    if (completedIds[resourceId]) {
      return;
    }

    const creditGain = 10;
    const newCredits = totalCredits + creditGain;

    setTotalCredits(newCredits);
    setCompletedIds((prev) => ({ ...prev, [resourceId]: true }));

    try {
      const response = await fetch(`${API_BASE}/credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: "STU-2026-001",
          totalCredits: newCredits,
        }),
      });

      if (!response.ok) {
        throw new Error("Credit update failed");
      }

      setBackendStatus("Online: API connected");
    } catch (error) {
      setBackendStatus("Offline: using local fallback");
      alert("Backend unavailable. Credits updated in local state for demo continuity.");
    }
  }

  return (
    <main className="mx-auto mt-6 max-w-6xl px-4 pb-10 text-slate-800">
      <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-lg">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl font-bold text-emerald-800">Credit Awarding System</h2>
            <p className="text-sm text-slate-600">Track and increase student credits when tasks are finished</p>
          </div>
          <p className="rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-800">Status: {backendStatus}</p>
        </div>

        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Current Credits</p>
          <p className="font-display text-4xl font-extrabold text-emerald-900">{totalCredits}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {sortedResources.map((resource) => (
            <article key={resource.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-base font-bold capitalize">{resource.title}</h3>
              <p className="text-xs uppercase tracking-wide text-emerald-700">{resource.category}</p>
              <p className="mt-1 text-sm text-slate-700">{resource.description}</p>

              <button
                type="button"
                disabled={Boolean(completedIds[resource.id])}
                onClick={() => markAsFinished(resource.id)}
                className="mt-3 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-emerald-700 disabled:bg-emerald-300"
              >
                {completedIds[resource.id] ? "Finished" : "Mark as Finished"}
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
