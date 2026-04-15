import { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:8086/api";
const ALLOWED_FILE_TYPES = ["pdf", "doc", "docx", "ppt", "pptx", "txt", "zip"];
const MAX_UPLOAD_MB = 25;
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500 flex items-center gap-1">⚠ {msg}</p>;
}
function inputCls(hasError) {
  return `mt-1 w-full rounded-lg border px-3 py-2 text-sm ${hasError ? "border-red-400 bg-red-50 focus:ring-1 focus:ring-red-400 focus:outline-none" : "border-slate-200 focus:ring-1 focus:ring-violet-400 focus:outline-none"}`;
}

export default function AdminResourcePage() {
  const [resources, setResources] = useState([]);
  const [statusTab, setStatusTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [filterFileType, setFilterFileType] = useState("");
  const [editing, setEditing] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [uploadForm, setUploadForm] = useState({ title: "", category: "", description: "", file: null });
  const [uploadErrors, setUploadErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [backendStatus, setBackendStatus] = useState("Connecting...");

  const loadResources = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/resources?status=ALL`);
      if (!res.ok) throw new Error();
      setResources(await res.json());
      setBackendStatus("Online");
    } catch { setBackendStatus("Offline"); }
  }, []);

  useEffect(() => { loadResources(); }, [loadResources]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    resources.length,
    pending:  resources.filter(r => r.status === "PENDING").length,
    approved: resources.filter(r => r.status === "APPROVED").length,
    rejected: resources.filter(r => r.status === "REJECTED").length,
  }), [resources]);

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...resources].sort((a, b) => Number(b.id) - Number(a.id));
    if (statusTab !== "ALL") list = list.filter(r => r.status === statusTab);
    if (search.trim()) list = list.filter(r => r.title?.toLowerCase().includes(search.toLowerCase()));
    if (filterFileType) list = list.filter(r => r.fileType?.toLowerCase() === filterFileType);
    return list;
  }, [resources, statusTab, search, filterFileType]);

  // ── Upload (admin → auto-approved) ────────────────────────────────────────
  function handleUploadInput(e) {
    const { name, value, files } = e.target;
    if (name === "file") { setUploadForm(p => ({ ...p, file: files?.[0] || null })); }
    else setUploadForm(p => ({ ...p, [name]: value }));
    if (uploadErrors[name]) setUploadErrors(p => { const n = { ...p }; delete n[name]; return n; });
  }

  function validateUpload() {
    const e = {};
    const { title, category, description, file } = uploadForm;
    if (!title.trim()) e.title = "Title is required.";
    else if (title.trim().length < 3) e.title = "Title must be at least 3 characters.";
    else if (title.trim().length > 100) e.title = "Title must be 100 characters or fewer.";

    if (!category.trim()) e.category = "Category is required.";
    else if (category.trim().length < 2) e.category = "Category must be at least 2 characters.";
    else if (category.trim().length > 50) e.category = "Category must be 50 characters or fewer.";

    if (!description.trim()) e.description = "Description is required.";
    else if (description.trim().length < 10) e.description = "Description must be at least 10 characters.";
    else if (description.trim().length > 500) e.description = "Description must be 500 characters or fewer.";

    if (!file) {
      e.file = "Please select a file.";
    } else {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ALLOWED_FILE_TYPES.includes(ext))
        e.file = `Invalid file type. Allowed: ${ALLOWED_FILE_TYPES.join(", ")}`;
      else if (file.size > MAX_UPLOAD_BYTES)
        e.file = `File too large. Maximum allowed size is ${MAX_UPLOAD_MB}MB.`;
    }
    setUploadErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateEdit() {
    const e = {};
    if (!editing.title.trim()) e.title = "Title is required.";
    else if (editing.title.trim().length < 3) e.title = "Title must be at least 3 characters.";
    else if (editing.title.trim().length > 100) e.title = "Title must be 100 characters or fewer.";

    if (!editing.category.trim()) e.category = "Category is required.";
    else if (editing.category.trim().length < 2) e.category = "Category must be at least 2 characters.";
    else if (editing.category.trim().length > 50) e.category = "Category must be 50 characters or fewer.";

    if (!editing.description.trim()) e.description = "Description is required.";
    else if (editing.description.trim().length < 10) e.description = "Description must be at least 10 characters.";
    else if (editing.description.trim().length > 500) e.description = "Description must be 500 characters or fewer.";

    setEditErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!validateUpload()) return;
    const { title, category, description, file } = uploadForm;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("title", title.trim()); fd.append("category", category.trim());
      fd.append("description", description.trim()); fd.append("file", file);
      fd.append("uploadedBy", "admin");
      const res = await fetch(`${API_BASE}/resources/upload`, { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const saved = await res.json();
      // Admin uploads go straight to APPROVED
      const approveRes = await fetch(`${API_BASE}/resources/${saved.id}/approve`, { method: "PUT" });
      const final = approveRes.ok ? await approveRes.json() : { ...saved, status: "APPROVED" };
      setResources(prev => [final, ...prev]);
      setUploadForm({ title: "", category: "", description: "", file: null });
      setUploadErrors({});
    } catch { alert("Upload failed."); }
    finally { setUploading(false); }
  }

  // ── Approve / Reject ──────────────────────────────────────────────────────
  async function setStatus(id, action) {
    const res = await fetch(`${API_BASE}/resources/${id}/${action}`, { method: "PUT" });
    if (res.ok) {
      const updated = await res.json();
      setResources(prev => prev.map(r => r.id === id ? updated : r));
    }
  }

  // ── Edit ──────────────────────────────────────────────────────────────────
  async function handleEditSave() {
    if (!validateEdit()) return;
    try {
      const res = await fetch(`${API_BASE}/resources/${editing.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editing.title, category: editing.category, description: editing.description }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setResources(prev => prev.map(r => r.id === updated.id ? updated : r));
      setEditing(null);
      setEditErrors({});
    } catch { alert("Update failed."); }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete(id) {
    if (!window.confirm("Permanently delete this resource?")) return;
    try {
      await fetch(`${API_BASE}/resources/${id}`, { method: "DELETE" });
      setResources(prev => prev.filter(r => r.id !== id));
    } catch { alert("Delete failed."); }
  }

  const statusStyle = {
    APPROVED: "bg-emerald-100 text-emerald-800",
    PENDING:  "bg-amber-100 text-amber-800",
    REJECTED: "bg-rose-100 text-rose-800",
  };

  const tabStyle = (tab) =>
    `rounded-lg px-4 py-2 text-xs font-bold uppercase transition-colors ${
      statusTab === tab ? "bg-violet-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
    }`;

  return (
    <main className="min-h-screen w-[83vw] ml-[17vw] mt-[5vh] px-4 pb-10 text-slate-800">

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold text-violet-800">Edit Resource</h3>

            <div className="mb-3">
              <label className="block text-xs uppercase tracking-wide text-slate-600">
                Title <span className="text-red-500">*</span>
              </label>
              <input value={editing.title} maxLength={100}
                onChange={e => { setEditing(p => ({ ...p, title: e.target.value })); if (editErrors.title) setEditErrors(p => ({ ...p, title: null })); }}
                className={inputCls(!!editErrors.title)} />
              <FieldError msg={editErrors.title} />
            </div>

            <div className="mb-3">
              <label className="block text-xs uppercase tracking-wide text-slate-600">
                Category <span className="text-red-500">*</span>
              </label>
              <input value={editing.category} maxLength={50}
                onChange={e => { setEditing(p => ({ ...p, category: e.target.value })); if (editErrors.category) setEditErrors(p => ({ ...p, category: null })); }}
                className={inputCls(!!editErrors.category)} />
              <FieldError msg={editErrors.category} />
            </div>

            <div className="mb-4">
              <label className="block text-xs uppercase tracking-wide text-slate-600">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea value={editing.description} rows={3} maxLength={500}
                onChange={e => { setEditing(p => ({ ...p, description: e.target.value })); if (editErrors.description) setEditErrors(p => ({ ...p, description: null })); }}
                className={inputCls(!!editErrors.description)} />
              <div className="flex justify-between items-start">
                <FieldError msg={editErrors.description} />
                <span className="text-[11px] text-slate-400">{editing.description.length}/500</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleEditSave} className="flex-1 rounded-lg bg-violet-700 py-2 text-sm font-bold text-white hover:bg-violet-800">Save</button>
              <button onClick={() => { setEditing(null); setEditErrors({}); }} className="flex-1 rounded-lg border py-2 text-sm hover:bg-slate-50">Cancel</button>
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
              <h2 className="font-display text-2xl font-bold text-violet-900">Resource Management</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">Approve, edit, delete and upload resources</p>
          </div>
          <p className={`rounded-md px-3 py-1 text-xs font-semibold ${backendStatus === "Online" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>
            ● {backendStatus}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total",    value: stats.total,    color: "bg-slate-50 border-slate-200 text-slate-800" },
            { label: "Pending",  value: stats.pending,  color: "bg-amber-50 border-amber-200 text-amber-900" },
            { label: "Approved", value: stats.approved, color: "bg-emerald-50 border-emerald-200 text-emerald-900" },
            { label: "Rejected", value: stats.rejected, color: "bg-rose-50 border-rose-200 text-rose-900" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-xl border px-4 py-3 ${color}`}>
              <p className="text-xs uppercase tracking-wide opacity-60">{label}</p>
              <p className="text-3xl font-extrabold">{value}</p>
            </div>
          ))}
        </div>

        {/* Upload Form */}
        <details className="mb-6 rounded-xl border border-violet-100 bg-violet-50">
          <summary className="cursor-pointer select-none rounded-xl px-4 py-3 text-sm font-semibold text-violet-800 hover:bg-violet-100">
            ＋ Upload New Resource (Auto-Approved)
          </summary>
          <form onSubmit={handleUpload} className="grid gap-3 p-4 md:grid-cols-2" noValidate>
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-600">
                Title <span className="text-red-500">*</span>
              </label>
              <input name="title" value={uploadForm.title} onChange={handleUploadInput}
                placeholder="E.g. ITPM Chapter 3" maxLength={100}
                className={inputCls(!!uploadErrors.title)} />
              <FieldError msg={uploadErrors.title} />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-600">
                Category <span className="text-red-500">*</span>
              </label>
              <input name="category" value={uploadForm.category} onChange={handleUploadInput}
                placeholder="E.g. Project Management" maxLength={50}
                className={inputCls(!!uploadErrors.category)} />
              <FieldError msg={uploadErrors.category} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wide text-slate-600">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea name="description" value={uploadForm.description} onChange={handleUploadInput}
                rows={2} maxLength={500} placeholder="Min. 10 characters…"
                className={inputCls(!!uploadErrors.description)} />
              <div className="flex justify-between items-start">
                <FieldError msg={uploadErrors.description} />
                <span className={`text-[11px] ${uploadForm.description.length > 450 ? "text-amber-500" : "text-slate-400"}`}>
                  {uploadForm.description.length}/500
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-600">
                File <span className="text-red-500">*</span>
              </label>
              <input type="file" name="file" onChange={handleUploadInput}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
                className={inputCls(!!uploadErrors.file)} />
              <FieldError msg={uploadErrors.file} />
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={uploading}
                className="rounded-lg bg-violet-700 px-5 py-2 text-sm font-bold text-white hover:bg-violet-800 disabled:opacity-50">
                {uploading ? "Uploading…" : "Upload"}
              </button>
            </div>
          </form>
        </details>

        {/* Filter Bar */}
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="flex flex-wrap gap-2">
            {["ALL","PENDING","APPROVED","REJECTED"].map(tab => (
              <button key={tab} onClick={() => setStatusTab(tab)} className={tabStyle(tab)}>
                {tab} {tab === "PENDING" && stats.pending > 0 && (
                  <span className="ml-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] text-white">{stats.pending}</span>
                )}
              </button>
            ))}
          </div>
          <input type="search" placeholder="🔍 Search…" value={search} onChange={e => setSearch(e.target.value)}
            className="min-w-36 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <select value={filterFileType} onChange={e => setFilterFileType(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="">All Types</option>
            {["pdf","doc","docx","ppt","pptx","txt","zip"].map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>
        </div>

        <p className="mb-3 text-xs text-slate-400">{filtered.length} resource(s)</p>

        {/* Resource Table */}
        <div className="overflow-hidden rounded-xl border border-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-center">Type</th>
                <th className="px-4 py-3 text-center">Date</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{r.title}</p>
                    <p className="text-xs text-slate-400 line-clamp-1">{r.description}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{r.category}</td>
                  <td className="px-4 py-3 text-center">
                    {r.fileType && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase">{r.fileType}</span>}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-slate-400">{r.uploadDate || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${statusStyle[r.status] || "bg-slate-100 text-slate-500"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-center gap-1">
                      {r.status === "PENDING" && (
                        <>
                          <button onClick={() => setStatus(r.id, "approve")} className="rounded bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-emerald-700">✓ Approve</button>
                          <button onClick={() => setStatus(r.id, "reject")} className="rounded bg-rose-500 px-2 py-1 text-[11px] font-bold text-white hover:bg-rose-600">✕ Reject</button>
                        </>
                      )}
                      {r.status === "REJECTED" && (
                        <button onClick={() => setStatus(r.id, "approve")} className="rounded bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-emerald-700">Re-approve</button>
                      )}
                      {r.status === "APPROVED" && (
                        <button onClick={() => setStatus(r.id, "reject")} className="rounded border border-rose-300 px-2 py-1 text-[11px] text-rose-700 hover:bg-rose-50">Reject</button>
                      )}
                      <button onClick={() => { setEditing({ id: r.id, title: r.title, category: r.category, description: r.description || "" }); setEditErrors({}); }}
                        className="rounded border border-violet-300 px-2 py-1 text-[11px] text-violet-700 hover:bg-violet-50">✏ Edit</button>
                      <button onClick={() => handleDelete(r.id)}
                        className="rounded border border-red-300 px-2 py-1 text-[11px] text-red-700 hover:bg-red-50">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-sm text-slate-400">No resources found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

