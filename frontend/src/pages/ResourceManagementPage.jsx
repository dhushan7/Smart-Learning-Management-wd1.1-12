import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:8080/api";
const ALLOWED_FILE_TYPES = ["pdf", "doc", "docx", "ppt", "pptx", "txt", "zip"];
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const MAX_UPLOAD_MB = 25;
const TITLE_MIN = 3;
const TITLE_MAX = 100;
const CATEGORY_MIN = 3;
const CATEGORY_MAX = 50;
const DESC_MIN = 10;
const DESC_MAX = 500;

export default function ResourceManagementPage() {
  const [resources, setResources] = useState([]);
  const [backendStatus, setBackendStatus] = useState("Connecting...");
  const [resourceForm, setResourceForm] = useState({
    title: "",
    category: "",
    description: "",
    file: null,
  });

  useEffect(() => {
    loadResources();
  }, []);

  const sortedResources = useMemo(
    () => [...resources].sort((a, b) => Number(b.id) - Number(a.id)),
    [resources]
  );

  async function loadResources() {
    try {
      const response = await fetch(`${API_BASE}/resources`);
      if (!response.ok) {
        setResources((prev) => prev);
        setBackendStatus("Offline: backend unavailable");
        return;
      }

      const data = await response.json();
      setResources(data || []);
      setBackendStatus("Online: API connected");
    } catch (error) {
      setResources((prev) => prev);
      setBackendStatus("Offline: backend unavailable");
    }
  }

  function validateFileType(fileName) {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";
    return ALLOWED_FILE_TYPES.includes(extension);
  }

  function validateResourceForm() {
    const title = resourceForm.title.trim();
    const category = resourceForm.category.trim();
    const description = resourceForm.description.trim();

    if (!title || !category || !description || !resourceForm.file) {
      return "Please fill all resource fields before submitting.";
    }

    if (title.length < TITLE_MIN || title.length > TITLE_MAX) {
      return `Title must be between ${TITLE_MIN} and ${TITLE_MAX} characters.`;
    }

    if (category.length < CATEGORY_MIN || category.length > CATEGORY_MAX) {
      return `Category must be between ${CATEGORY_MIN} and ${CATEGORY_MAX} characters.`;
    }

    if (description.length < DESC_MIN || description.length > DESC_MAX) {
      return `Description must be between ${DESC_MIN} and ${DESC_MAX} characters.`;
    }

    if (!validateFileType(resourceForm.file.name)) {
      return `Invalid file type. Allowed: ${ALLOWED_FILE_TYPES.join(", ")}`;
    }

    if (resourceForm.file.size > MAX_UPLOAD_BYTES) {
      return `File is too large. Maximum allowed size is ${MAX_UPLOAD_MB}MB.`;
    }

    return null;
  }

  function handleResourceInput(event) {
    const { name, value, files } = event.target;

    if (name === "file") {
      const selected = files && files[0] ? files[0] : null;
      setResourceForm((prev) => ({
        ...prev,
        file: selected,
      }));
      return;
    }

    setResourceForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleResourceSubmit(event) {
    event.preventDefault();

    const validationMessage = validateResourceForm();
    if (validationMessage) {
      alert(validationMessage);
      return;
    }

    const formData = new FormData();
    formData.append("title", resourceForm.title.trim());
    formData.append("category", resourceForm.category.trim());
    formData.append("description", resourceForm.description.trim());
    formData.append("file", resourceForm.file);

    try {
      const response = await fetch(`${API_BASE}/resources/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 413) {
          const errorBody = await response.json().catch(() => null);
          alert(errorBody?.message || `File is too large. Maximum allowed size is ${MAX_UPLOAD_MB}MB.`);
          return;
        }
        throw new Error("Resource save failed");
      }

      const saved = await response.json();
      setResources((prev) => [saved, ...prev]);
      setBackendStatus("Online: API connected");
      setResourceForm({ title: "", category: "", description: "", file: null });
    } catch (error) {
      const localItem = {
        id: Date.now(),
        title: resourceForm.title.trim(),
        category: resourceForm.category.trim(),
        description: resourceForm.description.trim(),
        fileUrl: resourceForm.file?.name || "uploaded-file",
      };

      setResources((prev) => [localItem, ...prev]);
      setBackendStatus("Offline: using local fallback");
      setResourceForm({ title: "", category: "", description: "", file: null });
      alert("Backend unavailable. Resource saved in local state for demo continuity.");
    }
  }

  return (
    <main className="mx-auto mt-6 max-w-6xl px-4 pb-10 text-slate-800">
      <section className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-lg">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl font-bold text-cyan-900">Resource Management</h2>
            <p className="text-sm text-slate-600">Upload and display learning materials</p>
          </div>
          <p className="rounded-md bg-cyan-50 px-3 py-2 text-xs text-cyan-800">Status: {backendStatus}</p>
        </div>

        <form onSubmit={handleResourceSubmit} className="grid gap-3 md:grid-cols-2">
          <label className="block text-xs uppercase tracking-wide text-slate-600">
            Title
            <input
              name="title"
              value={resourceForm.title}
              onChange={handleResourceInput}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm capitalize"
              placeholder="E.g. ITPM Chapter 3"
              required
              minLength={TITLE_MIN}
              maxLength={TITLE_MAX}
            />
          </label>

          <label className="block text-xs uppercase tracking-wide text-slate-600">
            Category
            <input
              name="category"
              value={resourceForm.category}
              onChange={handleResourceInput}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm capitalize"
              placeholder="E.g. Project Management"
              required
              minLength={CATEGORY_MIN}
              maxLength={CATEGORY_MAX}
            />
          </label>

          <label className="block text-xs uppercase tracking-wide text-slate-600 md:col-span-2">
            Description
            <textarea
              name="description"
              value={resourceForm.description}
              onChange={handleResourceInput}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={3}
              placeholder="Short summary of this resource"
              required
              minLength={DESC_MIN}
              maxLength={DESC_MAX}
            />
          </label>

          <label className="block text-xs uppercase tracking-wide text-slate-600">
            Upload File
            <input
              type="file"
              name="file"
              onChange={handleResourceInput}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
              required
            />
            <span className="mt-1 block text-[11px] text-slate-500">Max file size: {MAX_UPLOAD_MB}MB</span>
          </label>

          <div className="flex flex-wrap gap-2 md:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white hover:bg-cyan-800"
            >
              Submit
            </button>
          </div>
        </form>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {sortedResources.map((resource) => (
            <article key={resource.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-base font-bold capitalize">{resource.title}</h3>
              <p className="text-xs uppercase tracking-wide text-cyan-700">{resource.category}</p>
              <p className="mt-1 text-sm text-slate-700">{resource.description}</p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {resource.fileUrl?.toLowerCase().endsWith(".pdf") ? (
                  <a
                    href={`${API_BASE}/resources/file/view/${encodeURIComponent(resource.fileUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md bg-cyan-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-800"
                  >
                    Read PDF
                  </a>
                ) : null}
                <a
                  href={`${API_BASE}/resources/file/${encodeURIComponent(resource.fileUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-cyan-700 underline"
                >
                  {resource.fileUrl}
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
