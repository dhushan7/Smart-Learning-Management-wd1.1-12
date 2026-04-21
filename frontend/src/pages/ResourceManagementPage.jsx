import { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:8086/api";
const ALLOWED_FILE_TYPES = ["pdf", "doc", "docx", "ppt", "pptx", "txt", "zip"];
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const MAX_UPLOAD_MB = 25;

// ── Reusable field error component ───────────────────────────────────────────
function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500 flex items-center gap-1">⚠ {msg}</p>;
}

// ── Input class helper ────────────────────────────────────────────────────────
function inputCls(hasError) {
  return `mt-1 w-full rounded-lg border px-3 py-2 text-sm ${hasError ? "border-red-400 bg-red-50 focus:outline-none focus:ring-1 focus:ring-red-400" : "border-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400"}`;
}

export default function ResourceManagementPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [resources, setResources] = useState([]);
  const [backendStatus, setBackendStatus] = useState("Connecting...");
  const [form, setForm] = useState({ title: "", category: "", description: "", file: null });
  const [formErrors, setFormErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterFileType, setFilterFileType] = useState("");
  const [progressMap, setProgressMap] = useState({});
  const [favourites, setFavourites] = useState(new Set());

  // 1. Retrieve the real user from Local Storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Assuming your user object has a username property based on your Login component
        setCurrentUser(parsedUser.username); 
      } catch (err) {
        console.error("Failed to parse user data", err);
      }
    }
  }, []);

  const loadAll = useCallback(async () => {
    // Load general resources regardless of auth status
    try {
      const res = await fetch(`${API_BASE}/resources?status=APPROVED`);
      if (!res.ok) throw new Error();
      setResources(await res.json());
      setBackendStatus("Online: API connected");
    } catch { setBackendStatus("Offline: backend unavailable"); }

    // If we have a logged-in user, fetch their specific progress and favourites
    if (currentUser) {
      try {
        const prog = await fetch(`${API_BASE}/progress/${currentUser}`);
        if (prog.ok) {
          const data = await prog.json();
          const map = {};
          data.forEach(p => { map[p.resourceId] = p; });
          setProgressMap(map);
        }
      } catch { /* ignore */ }

      try {
        const fav = await fetch(`${API_BASE}/favourites/${currentUser}`);
        if (fav.ok) {
          const data = await fav.json();
          setFavourites(new Set(data.map(f => f.resourceId)));
        }
      } catch { /* ignore */ }
    }
  }, [currentUser]); // Added currentUser as dependency

  useEffect(() => { 
    loadAll(); 
  }, [loadAll]);

  const categories = useMemo(() => {
    return [...new Set(resources.map(r => r.category).filter(Boolean))].sort();
  }, [resources]);

  const filteredResources = useMemo(() => {
    let list = [...resources].sort((a, b) => Number(b.id) - Number(a.id));
    if (search.trim()) list = list.filter(r => r.title?.toLowerCase().includes(search.toLowerCase()));
    if (filterCategory) list = list.filter(r => r.category?.toLowerCase() === filterCategory.toLowerCase());
    if (filterFileType) list = list.filter(r => r.fileType?.toLowerCase() === filterFileType.toLowerCase());
    return list;
  }, [resources, search, filterCategory, filterFileType]);

  function handleFormInput(e) {
    const { name, value, files } = e.target;
    if (name === "file") {
      setForm(p => ({ ...p, file: files?.[0] || null }));
    } else {
      setForm(p => ({ ...p, [name]: value }));
    }
    // clear error on change
    if (formErrors[name]) setFormErrors(p => { const n = { ...p }; delete n[name]; return n; });
  }

  function validateUpload() {
    const e = {};
    const { title, category, description, file } = form;
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
    setFormErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!currentUser) {
      alert("You must be logged in to upload resources.");
      return;
    }
    if (!validateUpload()) return;
    
    const { title, category, description, file } = form;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("title", title.trim()); 
      fd.append("category", category.trim());
      fd.append("description", description.trim()); 
      fd.append("file", file);
      fd.append("uploadedBy", currentUser); // Using dynamic user

      const res = await fetch(`${API_BASE}/resources/upload`, { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const saved = await res.json();
      setResources(prev => [saved, ...prev]);
      setForm({ title: "", category: "", description: "", file: null });
      setFormErrors({});
      alert("Resource uploaded! Waiting for admin approval.");
    } catch { alert("Upload failed. Backend may be unavailable."); }
    finally { setUploading(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this resource permanently?")) return;
    try {
      const res = await fetch(`${API_BASE}/resources/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error();
      setResources(prev => prev.filter(r => r.id !== id));
    } catch { alert("Delete failed."); }
  }

  async function handleApprove(id) {
    const res = await fetch(`${API_BASE}/resources/${id}/approve`, { method: "PUT" });
    if (res.ok) setResources(prev => prev.map(r => r.id === id ? { ...r, status: "APPROVED" } : r));
  }

  async function handleReject(id) {
    const res = await fetch(`${API_BASE}/resources/${id}/reject`, { method: "PUT" });
    if (res.ok) setResources(prev => prev.map(r => r.id === id ? { ...r, status: "REJECTED" } : r));
  }

  async function updateProgress(resourceId, patch) {
    if (!currentUser) return; // Prevent updates if not logged in

    const current = progressMap[resourceId] || { opened: false, completed: false, progressPercent: 0 };
    const next = { ...current, ...patch, userId: currentUser, resourceId };
    setProgressMap(prev => ({ ...prev, [resourceId]: next }));
    try {
      await fetch(`${API_BASE}/progress`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
    } catch { /* keep local update */ }
  }

  async function toggleFavourite(resourceId) {
    if (!currentUser) {
      alert("Please log in to save favourites.");
      return;
    }

    const isFav = favourites.has(resourceId);
    const next = new Set(favourites);
    isFav ? next.delete(resourceId) : next.add(resourceId);
    setFavourites(next);
    try {
      if (isFav) {
        await fetch(`${API_BASE}/favourites?userId=${currentUser}&resourceId=${resourceId}`, { method: "DELETE" });
      } else {
        await fetch(`${API_BASE}/favourites`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUser, resourceId }),
        });
      }
    } catch { /* keep optimistic update */ }
  }

  const statusStyle = { APPROVED: "bg-emerald-100 text-emerald-800", PENDING: "bg-amber-100 text-amber-800", REJECTED: "bg-rose-100 text-rose-800" };

  return (
    <main className="mx-auto mt-6 max-w-6xl px-4 pb-10 text-slate-800 mt-[10vh] ">
      <section className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-lg">
        {/* Header */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl font-bold text-cyan-900">Resource Management</h2>
            <p className="text-sm text-slate-500">
              {currentUser ? `Welcome back, ${currentUser} | Upload, browse, track progress and save favourites` : "Upload, browse, track progress and save favourites"}
            </p>
          </div>
          <p className="rounded-md bg-cyan-50 px-3 py-1 text-xs text-cyan-800">{backendStatus}</p>
        </div>

        {/* Upload Form (Disabled visually if no user) */}
        <details className="mb-5 rounded-xl border border-cyan-100 bg-cyan-50">
          <summary className="cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100 select-none">
            ＋ Upload New Resource
          </summary>
          <form onSubmit={handleUpload} className="grid gap-3 p-4 md:grid-cols-2" noValidate>
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-600">
                Title <span className="text-red-500">*</span>
              </label>
              <input name="title" value={form.title} onChange={handleFormInput}
                placeholder="E.g. ITPM Chapter 3" maxLength={100} disabled={!currentUser}
                className={inputCls(!!formErrors.title)} />
              <FieldError msg={formErrors.title} />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-600">
                Category / Subject <span className="text-red-500">*</span>
              </label>
              <input name="category" value={form.category} onChange={handleFormInput}
                placeholder="E.g. Project Management" maxLength={50} disabled={!currentUser}
                className={inputCls(!!formErrors.category)} />
              <FieldError msg={formErrors.category} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wide text-slate-600">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea name="description" value={form.description} onChange={handleFormInput}
                rows={2} maxLength={500} placeholder="Min. 10 characters…" disabled={!currentUser}
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
                File <span className="text-red-500">*</span>
              </label>
              <input type="file" name="file" onChange={handleFormInput}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip" disabled={!currentUser}
                className={inputCls(!!formErrors.file)} />
              <div className="flex justify-between items-start">
                <FieldError msg={formErrors.file} />
                <span className="text-[11px] text-slate-400">Max {MAX_UPLOAD_MB}MB · {ALLOWED_FILE_TYPES.join(", ")}</span>
              </div>
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={uploading || !currentUser}
                className="rounded-lg bg-cyan-700 px-5 py-2 text-sm font-bold text-white hover:bg-cyan-800 disabled:opacity-50 disabled:cursor-not-allowed">
                {!currentUser ? "Log in to upload" : uploading ? "Uploading…" : "Upload"}
              </button>
            </div>
          </form>
        </details>

        {/* Search & Filter */}
        <div className="mb-5 flex flex-wrap gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <input type="search" placeholder="🔍 Search by name…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="min-w-40 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white">
            <option value="">All Subjects</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterFileType} onChange={e => setFilterFileType(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white">
            <option value="">All File Types</option>
            {["pdf","doc","docx","ppt","pptx","txt","zip"].map(t => (
              <option key={t} value={t}>{t.toUpperCase()}</option>
            ))}
          </select>
          {(search || filterCategory || filterFileType) && (
            <button onClick={() => { setSearch(""); setFilterCategory(""); setFilterFileType(""); }}
              className="rounded-lg border border-rose-200 px-3 py-1 text-xs text-rose-600 hover:bg-rose-50">
              ✕ Clear
            </button>
          )}
        </div>

        {/* Resource Grid */}
        <p className="mb-3 text-xs text-slate-400">{filteredResources.length} resource(s) found</p>
        <div className="grid gap-4 md:grid-cols-2">
          {filteredResources.map(resource => {
            const prog = progressMap[resource.id] || {};
            const pct = prog.progressPercent || 0;
            const isFav = favourites.has(resource.id);
            return (
              <article key={resource.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold capitalize truncate">{resource.title}</h3>
                    <p className="text-xs uppercase tracking-wide text-cyan-700">{resource.category}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button onClick={() => toggleFavourite(resource.id)} className="text-xl leading-none transition-transform hover:scale-110" title={isFav ? "Remove favourite" : "Add favourite"}>
                      {isFav ? "❤️" : "🤍"}
                    </button>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${statusStyle[resource.status] || "bg-slate-100 text-slate-500"}`}>
                      {resource.status || "—"}
                    </span>
                  </div>
                </div>

                <p className="mt-1 text-sm text-slate-600 line-clamp-2">{resource.description}</p>

                <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] text-slate-400">
                  {resource.fileType && <span className="rounded bg-slate-100 px-1.5 py-0.5 font-bold uppercase">{resource.fileType}</span>}
                  {resource.uploadDate && <span>📅 {resource.uploadDate}</span>}
                  {resource.uploadedBy && <span>👤 {resource.uploadedBy}</span>}
                </div>

                {/* Progress */}
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-slate-500">
                    <span>Progress {prog.completed ? "· ✓ Completed" : prog.opened ? "· Opened" : ""}</span>
                    <span className="font-semibold">{pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full transition-all duration-300 ${pct >= 100 ? "bg-emerald-500" : "bg-cyan-500"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <button onClick={() => updateProgress(resource.id, { opened: true, progressPercent: Math.max(pct, 10) })}
                      disabled={!!prog.opened || !currentUser}
                      className="rounded bg-cyan-50 px-2 py-1 text-[11px] font-semibold text-cyan-800 hover:bg-cyan-100 disabled:opacity-40 disabled:cursor-not-allowed">
                      {prog.opened ? "✓ Opened" : "Mark Opened"}
                    </button>
                    <button onClick={() => updateProgress(resource.id, { opened: true, completed: true, progressPercent: 100 })}
                      disabled={!!prog.completed || !currentUser}
                      className="rounded bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed">
                      {prog.completed ? "✓ Completed" : "Mark Complete"}
                    </button>
                    {!prog.completed && pct > 0 && pct < 100 && (
                      <button onClick={() => updateProgress(resource.id, { progressPercent: Math.min(pct + 25, 100) })}
                        disabled={!currentUser}
                        className="rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-200 disabled:opacity-40">+25%</button>
                    )}
                  </div>
                </div>

                {/* File links */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {resource.fileUrl?.toLowerCase().endsWith(".pdf") && (
                    <a href={`${API_BASE}/resources/file/view/${encodeURIComponent(resource.fileUrl)}`} target="_blank" rel="noreferrer"
                      className="rounded bg-cyan-100 px-2 py-1 text-xs font-semibold text-cyan-800 hover:bg-cyan-200">
                      📖 Read PDF
                    </a>
                  )}
                  <a href={`${API_BASE}/resources/file/download/${encodeURIComponent(resource.fileUrl)}${currentUser ? `?userId=${currentUser}` : ''}`}
                    onClick={() => updateProgress(resource.id, { opened: true, progressPercent: Math.max(pct, 10) })}
                    className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700 hover:bg-slate-200">
                    ⬇ Download (+2 credits)
                  </a>
                </div>
              </article>
            );
          })}
          {filteredResources.length === 0 && (
            <p className="col-span-2 py-12 text-center text-sm text-slate-400">No resources found. Try adjusting your search or filters.</p>
          )}
        </div>
      </section>
    </main>
  );
}