import { useCallback, useEffect, useState } from "react";

const API_BASE = "http://localhost:8080/api";
const ACTIVITIES = [
  "Quiz Completion",
  "Assignment Submission",
  "Session Attendance",
  "Resource Completion",
  "Hackathon / Competition",
  "Custom Activity",
];

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500 flex items-center gap-1">⚠ {msg}</p>;
}
function inputCls(hasError) {
  return `mt-1 w-full rounded-lg border px-3 py-2 text-sm ${hasError ? "border-red-400 bg-red-50 focus:ring-1 focus:ring-red-400 focus:outline-none" : "border-slate-200 focus:ring-1 focus:ring-violet-400 focus:outline-none"}`;
}

export default function AdminCreditPage() {
  const [users, setUsers] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [totalCredits, setTotalCredits] = useState(null);
  const [history, setHistory] = useState([]);
  const [backendStatus, setBackendStatus] = useState("Connecting...");

  const [awardForm, setAwardForm] = useState({
    studentId: "",
    activity: ACTIVITIES[0],
    customActivity: "",
    credits: "",
  });
  const [awardErrors, setAwardErrors] = useState({});
  const [awarding, setAwarding] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [editErrors, setEditErrors] = useState({});

  // Load users on mount
  useEffect(() => {
    fetch(`${API_BASE}/users`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setUsers(data || []);
        if (data?.length > 0) {
          const first = data[0].username || data[0].name || `User #${data[0].id}`;
          setSelectedStudent(first);
          setAwardForm(p => ({ ...p, studentId: first }));
        } else {
          setSelectedStudent("STU-2026-001");
          setAwardForm(p => ({ ...p, studentId: "STU-2026-001" }));
        }
        setBackendStatus("Online");
      })
      .catch(() => {
        setSelectedStudent("STU-2026-001");
        setAwardForm(p => ({ ...p, studentId: "STU-2026-001" }));
        setBackendStatus("Offline");
      });
  }, []);

  // Load credits + history whenever selected student changes
  const loadStudentData = useCallback(async (studentId) => {
    if (!studentId) return;
    try {
      const [credRes, histRes] = await Promise.all([
        fetch(`${API_BASE}/credits/student/${studentId}`),
        fetch(`${API_BASE}/credits/history/${studentId}`),
      ]);
      if (credRes.ok) { const d = await credRes.json(); setTotalCredits(d.totalCredits ?? 0); }
      if (histRes.ok) setHistory(await histRes.json());
      setBackendStatus("Online");
    } catch { setBackendStatus("Offline"); }
  }, []);

  useEffect(() => { if (selectedStudent) loadStudentData(selectedStudent); }, [selectedStudent, loadStudentData]);

  const studentOptions = users.length > 0
    ? users.map(u => u.username || u.name || `User #${u.id}`)
    : ["STU-2026-001", "STU-2026-002", "STU-2026-003"];

  function handleAwardInput(e) {
    const { name, value } = e.target;
    setAwardForm(p => ({ ...p, [name]: value }));
    if (awardErrors[name]) setAwardErrors(p => { const n = { ...p }; delete n[name]; return n; });
  }

  function validateAward() {
    const e = {};
    const activity = awardForm.activity === "Custom Activity"
      ? awardForm.customActivity.trim()
      : awardForm.activity;
    const credits = parseInt(awardForm.credits, 10);

    if (!awardForm.studentId.trim()) e.studentId = "Please select a student.";

    if (awardForm.activity === "Custom Activity") {
      if (!awardForm.customActivity.trim()) e.customActivity = "Custom activity name is required.";
      else if (awardForm.customActivity.trim().length < 3) e.customActivity = "Activity name must be at least 3 characters.";
      else if (awardForm.customActivity.trim().length > 100) e.customActivity = "Activity name must be 100 characters or fewer.";
    }

    if (!awardForm.credits) e.credits = "Credits amount is required.";
    else if (isNaN(credits)) e.credits = "Credits must be a valid number.";
    else if (credits <= 0) e.credits = "Credits must be a positive number (greater than zero).";
    else if (credits > 1000) e.credits = "Credits cannot exceed 1000 per transaction.";
    else if (!Number.isInteger(Number(awardForm.credits))) e.credits = "Credits must be a whole number.";

    setAwardErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateEditTx() {
    const e = {};
    const credits = parseInt(editingTx.credits, 10);
    if (!editingTx.activity.trim()) e.activity = "Activity is required.";
    else if (editingTx.activity.trim().length < 3) e.activity = "Activity must be at least 3 characters.";
    else if (editingTx.activity.trim().length > 100) e.activity = "Activity must be 100 characters or fewer.";

    if (!editingTx.credits) e.credits = "Credits amount is required.";
    else if (isNaN(credits)) e.credits = "Credits must be a valid number.";
    else if (credits <= 0) e.credits = "Credits must be a positive number.";
    else if (credits > 1000) e.credits = "Credits cannot exceed 1000.";

    setEditErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleAward(e) {
    e.preventDefault();
    if (!validateAward()) return;
    const activity = awardForm.activity === "Custom Activity"
      ? awardForm.customActivity.trim()
      : awardForm.activity;
    const credits = parseInt(awardForm.credits, 10);
    setAwarding(true);
    try {
      const res = await fetch(`${API_BASE}/credits/award`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: awardForm.studentId, activity, credits }),
      });
      if (!res.ok) { const msg = await res.text(); alert(msg || "Award failed."); return; }
      await loadStudentData(selectedStudent);
      setAwardForm(p => ({ ...p, credits: "", customActivity: "" }));
      setAwardErrors({});
      alert(`✓ Awarded ${credits} credit(s) to ${awardForm.studentId}`);
    } catch { alert("Failed. Backend may be unavailable."); }
    finally { setAwarding(false); }
  }

  async function handleDeleteTx(tx) {
    if (!window.confirm(`Delete "${tx.activity}" (+${tx.credits} credits)?`)) return;
    try {
      await fetch(`${API_BASE}/credits/transaction/${tx.id}`, { method: "DELETE" });
      await loadStudentData(selectedStudent);
    } catch { alert("Delete failed."); }
  }

  async function handleEditSave() {
    if (!validateEditTx()) return;
    const credits = parseInt(editingTx.credits, 10);
    try {
      const res = await fetch(`${API_BASE}/credits/transaction/${editingTx.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activity: editingTx.activity.trim(), credits }),
      });
      if (!res.ok) throw new Error();
      setEditingTx(null);
      setEditErrors({});
      await loadStudentData(selectedStudent);
    } catch { alert("Update failed."); }
  }

  function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <main className="mx-auto mt-6 max-w-6xl px-4 pb-10 text-slate-800">

      {/* Edit Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold text-violet-800">Edit Transaction</h3>

            <div className="mb-3">
              <label className="block text-xs uppercase tracking-wide text-slate-600">
                Activity <span className="text-red-500">*</span>
              </label>
              <input value={editingTx.activity} maxLength={100}
                onChange={e => { setEditingTx(p => ({ ...p, activity: e.target.value })); if (editErrors.activity) setEditErrors(p => ({ ...p, activity: null })); }}
                className={inputCls(!!editErrors.activity)} />
              <FieldError msg={editErrors.activity} />
            </div>

            <div className="mb-4">
              <label className="block text-xs uppercase tracking-wide text-slate-600">
                Credits <span className="text-red-500">*</span>
              </label>
              <input type="number" min="1" max="1000" value={editingTx.credits}
                onChange={e => { setEditingTx(p => ({ ...p, credits: e.target.value })); if (editErrors.credits) setEditErrors(p => ({ ...p, credits: null })); }}
                className={inputCls(!!editErrors.credits)} />
              <FieldError msg={editErrors.credits} />
              {!editErrors.credits && <span className="text-[11px] text-slate-400">Must be 1–1000</span>}
            </div>

            <div className="flex gap-3">
              <button onClick={handleEditSave} className="flex-1 rounded-lg bg-violet-700 py-2 text-sm font-bold text-white hover:bg-violet-800">Save</button>
              <button onClick={() => { setEditingTx(null); setEditErrors({}); }} className="flex-1 rounded-lg border py-2 text-sm hover:bg-slate-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <section className="rounded-2xl border border-violet-100 bg-white p-6 shadow-lg">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-violet-700 px-2 py-1 text-xs font-bold uppercase text-white">Admin</span>
              <h2 className="font-display text-2xl font-bold text-violet-900">Credit Management</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">Award credits, view history, edit and delete transactions</p>
          </div>
          <p className={`rounded-md px-3 py-1 text-xs font-semibold ${backendStatus === "Online" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>
            ● {backendStatus}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── Award Credits Form ── */}
          <div className="rounded-xl border border-violet-100 bg-violet-50 p-5">
            <h3 className="mb-4 text-base font-bold text-violet-800">🏅 Award Credits</h3>
            <form onSubmit={handleAward} className="space-y-3" noValidate>

              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-600">
                  Student <span className="text-red-500">*</span>
                </label>
                <select name="studentId" value={awardForm.studentId} onChange={handleAwardInput}
                  className={inputCls(!!awardErrors.studentId)}>
                  {[...new Set(studentOptions)].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <FieldError msg={awardErrors.studentId} />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-600">
                  Activity <span className="text-red-500">*</span>
                </label>
                <select name="activity" value={awardForm.activity} onChange={handleAwardInput}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  {ACTIVITIES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              {awardForm.activity === "Custom Activity" && (
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-600">
                    Custom Activity Name <span className="text-red-500">*</span>
                  </label>
                  <input name="customActivity" value={awardForm.customActivity} onChange={handleAwardInput}
                    placeholder="E.g. Hackathon Win" maxLength={100}
                    className={inputCls(!!awardErrors.customActivity)} />
                  <FieldError msg={awardErrors.customActivity} />
                </div>
              )}

              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-600">
                  Credits to Award <span className="text-red-500">*</span>
                </label>
                <input type="number" name="credits" value={awardForm.credits} onChange={handleAwardInput}
                  min="1" max="1000" placeholder="E.g. 5"
                  className={inputCls(!!awardErrors.credits)} />
                <FieldError msg={awardErrors.credits} />
                {!awardErrors.credits && (
                  <span className="text-[11px] text-slate-400">Positive integer only (1–1000) — negative or zero not allowed</span>
                )}
              </div>

              <button type="submit" disabled={awarding}
                className="w-full rounded-lg bg-violet-700 py-2.5 text-sm font-bold text-white hover:bg-violet-800 disabled:opacity-50">
                {awarding ? "Awarding…" : "Award Credits"}
              </button>
            </form>
          </div>

          {/* ── Student Credits Overview ── */}
          <div>
            <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <label className="block text-xs uppercase tracking-wide text-slate-500 mb-2">View Student</label>
              <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}
                className="mb-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                {[...new Set(studentOptions)].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {totalCredits !== null && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-emerald-600">Total Credits</p>
                  <p className="text-4xl font-extrabold text-emerald-800">{totalCredits}</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-emerald-200">
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.min(totalCredits, 100)}%` }} />
                  </div>
                </div>
              )}
            </div>

            <h3 className="mb-2 font-semibold text-slate-700">Credit History — {selectedStudent}</h3>
            {history.length === 0 ? (
              <p className="rounded-xl border bg-slate-50 py-8 text-center text-sm text-slate-400">No credit history yet.</p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-100">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2 text-left">Activity</th>
                      <th className="px-3 py-2 text-center">Credits</th>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((tx, i) => (
                      <tr key={tx.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="px-3 py-2">
                          <span className="font-medium">{tx.activity}</span>
                          {tx.type === "AUTO_DOWNLOAD" && (
                            <span className="ml-1 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700">auto</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center font-bold text-emerald-600">+{tx.credits}</td>
                        <td className="px-3 py-2 text-xs text-slate-400">{formatDate(tx.awardedAt)}</td>
                        <td className="px-3 py-2">
                          <div className="flex justify-center gap-1">
                            <button onClick={() => { setEditingTx({ id: tx.id, activity: tx.activity, credits: tx.credits }); setEditErrors({}); }}
                              className="rounded border border-violet-300 px-2 py-0.5 text-xs text-violet-700 hover:bg-violet-50">✏</button>
                            <button onClick={() => handleDeleteTx(tx)}
                              className="rounded border border-rose-300 px-2 py-0.5 text-xs text-rose-700 hover:bg-rose-50">🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-2 text-xs text-slate-400">💡 Downloads automatically award +2 credits.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

