import { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:8080/api";

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500 flex items-center gap-1">⚠ {msg}</p>;
}
function inputCls(hasError) {
  return `mt-1 w-full rounded-lg border px-3 py-2 text-sm ${hasError ? "border-red-400 bg-red-50 focus:ring-1 focus:ring-red-400 focus:outline-none" : "border-slate-200 focus:ring-1 focus:ring-violet-400 focus:outline-none"}`;
}

export default function AdminSessionPage() {
  const [sessions, setSessions] = useState([]);
  const [backendStatus, setBackendStatus] = useState("Connecting...");
  const [editingSession, setEditingSession] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [form, setForm] = useState({
    title: "", description: "", sessionDate: "", sessionTime: "", meetingLink: "", createdBy: "admin",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const today = new Date().toISOString().split("T")[0];

  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/sessions`);
      if (!res.ok) throw new Error();
      setSessions(await res.json());
      setBackendStatus("Online");
    } catch { setBackendStatus("Offline"); }
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const filtered = useMemo(() => {
    let list = [...sessions].sort((a, b) => (a.sessionDate || "").localeCompare(b.sessionDate || ""));
    if (filterStatus !== "ALL") list = list.filter(s => s.status === filterStatus);
    return list;
  }, [sessions, filterStatus]);

  const stats = useMemo(() => ({
    total:     sessions.length,
    upcoming:  sessions.filter(s => s.status === "UPCOMING").length,
    active:    sessions.filter(s => s.status === "ACTIVE").length,
    completed: sessions.filter(s => s.status === "COMPLETED").length,
  }), [sessions]);

  function handleFormInput(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (formErrors[name]) setFormErrors(p => { const n = { ...p }; delete n[name]; return n; });
  }

  function validate(data, setErrors) {
    const e = {};
    if (!data.title?.trim()) e.title = "Title is required.";
    else if (data.title.trim().length < 3) e.title = "Title must be at least 3 characters.";
    else if (data.title.trim().length > 100) e.title = "Title must be 100 characters or fewer.";

    if (data.description && data.description.length > 500)
      e.description = "Description must be 500 characters or fewer.";

    if (!data.sessionDate) e.sessionDate = "Session date is required.";
    else if (data.sessionDate < today) e.sessionDate = "Session date cannot be in the past.";

    if (!data.meetingLink?.trim()) e.meetingLink = "Meeting link is required.";
    else if (!/^https?:\/\/.+/.test(data.meetingLink.trim()))
      e.meetingLink = "Meeting link must start with http:// or https://";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!validate(form, setFormErrors)) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/sessions`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status: "UPCOMING" }),
      });
      if (!res.ok) { const msg = await res.text(); alert(msg || "Create failed."); return; }
      const saved = await res.json();
      setSessions(prev => [...prev, saved]);
      setForm({ title: "", description: "", sessionDate: "", sessionTime: "", meetingLink: "", createdBy: "admin" });
      setFormErrors({});
    } catch { alert("Create failed. Backend may be unavailable."); }
    finally { setSubmitting(false); }
  }

  async function handleEditSave() {
    if (!validate(editingSession, setEditErrors)) return;
    try {
      const res = await fetch(`${API_BASE}/sessions/${editingSession.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSession),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
      setEditingSession(null);
      setEditErrors({});
    } catch { alert("Update failed."); }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this session?")) return;
    try {
      await fetch(`${API_BASE}/sessions/${id}`, { method: "DELETE" });
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch { alert("Delete failed."); }
  }

  async function changeStatus(id, status) {
    try {
      const res = await fetch(`${API_BASE}/sessions/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) { const updated = await res.json(); setSessions(prev => prev.map(s => s.id === id ? updated : s)); }
    } catch { /* ignore */ }
  }

  function attendeeCount(session) {
    if (!session.attendees || !session.attendees.trim()) return 0;
    return session.attendees.split(",").filter(Boolean).length;
  }

  const statusStyle = {
    UPCOMING:  "bg-blue-100 text-blue-800",
    ACTIVE:    "bg-emerald-100 text-emerald-800",
    COMPLETED: "bg-slate-100 text-slate-600",
  };

  const tabStyle = (tab) =>
    `rounded-lg px-4 py-2 text-xs font-bold uppercase transition-colors ${
      filterStatus === tab ? "bg-violet-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
    }`;

  return (
    <main className="mx-auto mt-6 max-w-6xl px-4 pb-10 text-slate-800">

      {/* Edit Modal */}
      {editingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold text-violet-800">Edit Session</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-wide text-slate-600">
                  Title <span className="text-red-500">*</span>
                </label>
                <input value={editingSession.title} maxLength={100}
                  onChange={e => { setEditingSession(p => ({ ...p, title: e.target.value })); if (editErrors.title) setEditErrors(p => ({ ...p, title: null })); }}
                  className={inputCls(!!editErrors.title)} />
                <FieldError msg={editErrors.title} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-wide text-slate-600">Description</label>
                <textarea value={editingSession.description || ""} rows={2} maxLength={500}
                  onChange={e => { setEditingSession(p => ({ ...p, description: e.target.value })); if (editErrors.description) setEditErrors(p => ({ ...p, description: null })); }}
                  className={inputCls(!!editErrors.description)} />
                <div className="flex justify-between items-start">
                  <FieldError msg={editErrors.description} />
                  <span className="text-[11px] text-slate-400">{(editingSession.description || "").length}/500</span>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-600">
                  Date <span className="text-red-500">*</span>
                </label>
                <input type="date" value={editingSession.sessionDate || ""} min={today}
                  onChange={e => { setEditingSession(p => ({ ...p, sessionDate: e.target.value })); if (editErrors.sessionDate) setEditErrors(p => ({ ...p, sessionDate: null })); }}
                  className={inputCls(!!editErrors.sessionDate)} />
                <FieldError msg={editErrors.sessionDate} />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-600">Time</label>
                <input type="time" value={editingSession.sessionTime || ""}
                  onChange={e => setEditingSession(p => ({ ...p, sessionTime: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-wide text-slate-600">
                  Meeting Link <span className="text-red-500">*</span>
                </label>
                <input value={editingSession.meetingLink || ""}
                  placeholder="https://"
                  onChange={e => { setEditingSession(p => ({ ...p, meetingLink: e.target.value })); if (editErrors.meetingLink) setEditErrors(p => ({ ...p, meetingLink: null })); }}
                  className={inputCls(!!editErrors.meetingLink)} />
                <FieldError msg={editErrors.meetingLink} />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-600">Status</label>
                <select value={editingSession.status || "UPCOMING"}
                  onChange={e => setEditingSession(p => ({ ...p, status: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  {["UPCOMING","ACTIVE","COMPLETED"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={handleEditSave} className="flex-1 rounded-lg bg-violet-700 py-2 text-sm font-bold text-white hover:bg-violet-800">Save Changes</button>
              <button onClick={() => { setEditingSession(null); setEditErrors({}); }} className="flex-1 rounded-lg border py-2 text-sm hover:bg-slate-50">Cancel</button>
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
              <h2 className="font-display text-2xl font-bold text-violet-900">Study Sessions</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">Create, edit, and manage all study support sessions</p>
          </div>
          <p className={`rounded-md px-3 py-1 text-xs font-semibold ${backendStatus === "Online" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>
            ● {backendStatus}
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total",     value: stats.total,     color: "bg-slate-50 border-slate-200 text-slate-800" },
            { label: "Upcoming",  value: stats.upcoming,  color: "bg-blue-50 border-blue-200 text-blue-900" },
            { label: "Active",    value: stats.active,    color: "bg-emerald-50 border-emerald-200 text-emerald-900" },
            { label: "Completed", value: stats.completed, color: "bg-slate-50 border-slate-200 text-slate-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-xl border px-4 py-3 ${color}`}>
              <p className="text-xs uppercase tracking-wide opacity-60">{label}</p>
              <p className="text-3xl font-extrabold">{value}</p>
            </div>
          ))}
        </div>

        {/* Create Form */}
        <details className="mb-6 rounded-xl border border-violet-100 bg-violet-50">
          <summary className="cursor-pointer select-none rounded-xl px-4 py-3 text-sm font-semibold text-violet-800 hover:bg-violet-100">
            ＋ Create New Session
          </summary>
          <form onSubmit={handleCreate} className="grid gap-3 p-4 md:grid-cols-2" noValidate>
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wide text-slate-600">
                Title <span className="text-red-500">*</span>
              </label>
              <input name="title" value={form.title} onChange={handleFormInput}
                placeholder="E.g. Python Basics Workshop" maxLength={100}
                className={inputCls(!!formErrors.title)} />
              <FieldError msg={formErrors.title} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wide text-slate-600">Description</label>
              <textarea name="description" value={form.description} onChange={handleFormInput}
                rows={2} maxLength={500} placeholder="What will be covered?"
                className={inputCls(!!formErrors.description)} />
              <div className="flex justify-between items-start">
                <FieldError msg={formErrors.description} />
                <span className={`text-[11px] ${form.description.length > 450 ? "text-amber-500" : "text-slate-400"}`}>
                  {form.description.length}/500
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-600">
                Date <span className="text-red-500">*</span>
              </label>
              <input type="date" name="sessionDate" value={form.sessionDate} onChange={handleFormInput}
                min={today} className={inputCls(!!formErrors.sessionDate)} />
              <FieldError msg={formErrors.sessionDate} />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-600">Time</label>
              <input type="time" name="sessionTime" value={form.sessionTime} onChange={handleFormInput}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wide text-slate-600">
                Meeting Link <span className="text-red-500">*</span>
              </label>
              <input name="meetingLink" value={form.meetingLink} onChange={handleFormInput}
                placeholder="https://meet.google.com/..."
                className={inputCls(!!formErrors.meetingLink)} />
              <FieldError msg={formErrors.meetingLink} />
            </div>

            <div className="md:col-span-2">
              <button type="submit" disabled={submitting}
                className="rounded-lg bg-violet-700 px-6 py-2.5 text-sm font-bold text-white hover:bg-violet-800 disabled:opacity-50">
                {submitting ? "Creating…" : "📅 Create Session"}
              </button>
            </div>
          </form>
        </details>

        {/* Filter tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          {["ALL","UPCOMING","ACTIVE","COMPLETED"].map(tab => (
            <button key={tab} onClick={() => setFilterStatus(tab)} className={tabStyle(tab)}>{tab}</button>
          ))}
        </div>

        <p className="mb-3 text-xs text-slate-400">{filtered.length} session(s)</p>

        {/* Sessions Table */}
        <div className="overflow-hidden rounded-xl border border-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-center">Date & Time</th>
                <th className="px-4 py-3 text-center">Attendees</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{s.title}</p>
                    {s.description && <p className="text-xs text-slate-400 line-clamp-1">{s.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-slate-500">
                    <p>{s.sessionDate || "—"}</p>
                    {s.sessionTime && <p>{s.sessionTime}</p>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold">
                      👥 {attendeeCount(s)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={s.status || "UPCOMING"}
                      onChange={e => changeStatus(s.id, e.target.value)}
                      className={`rounded px-2 py-0.5 text-[11px] font-bold uppercase border-0 cursor-pointer ${statusStyle[s.status] || "bg-slate-100 text-slate-500"}`}>
                      {["UPCOMING","ACTIVE","COMPLETED"].map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1">
                      <a href={s.meetingLink} target="_blank" rel="noreferrer"
                        className="rounded bg-violet-100 px-2 py-1 text-[11px] font-semibold text-violet-700 hover:bg-violet-200">
                        🔗 Link
                      </a>
                      <button onClick={() => { setEditingSession({ ...s }); setEditErrors({}); }}
                        className="rounded border border-violet-300 px-2 py-1 text-[11px] text-violet-700 hover:bg-violet-50">✏ Edit</button>
                      <button onClick={() => handleDelete(s.id)}
                        className="rounded border border-red-300 px-2 py-1 text-[11px] text-red-700 hover:bg-red-50">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center text-sm text-slate-400">No sessions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

