import { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:8080/api";
const ALLOWED_FILE_TYPES = ["pdf", "doc", "docx", "ppt", "pptx", "txt", "zip"];

export default function Dashboard() {
  const [resources, setResources] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [backendStatus, setBackendStatus] = useState("Connecting...");

  const [resourceForm, setResourceForm] = useState({
    title: "",
    category: "",
    description: "",
    fileUrl: "",
    file: null,
  });

  const [reviewForm, setReviewForm] = useState({
    resourceId: "",
    rating: 5,
    feedbackText: "",
  });

  const loadAllData = useCallback(async () => {
    await Promise.all([loadResources(), loadReviews(), loadCredits()]);
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

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
      setResources((data || []).map((item) => ({ ...item, completed: false })));
      setBackendStatus("Online: API connected");
    } catch (error) {
      setResources([]);
      setBackendStatus("Offline: backend unavailable");
    }
  }

  async function loadReviews() {
    try {
      const response = await fetch(`${API_BASE}/reviews`);
      if (!response.ok) {
        throw new Error("Review API failed");
      }
      const data = await response.json();
      setReviews(data || []);
    } catch (error) {
      setReviews([]);
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
      setTotalCredits(0);
    }
  }

  function handleResourceInput(event) {
    const { name, value, files } = event.target;

    if (name === "file") {
      const selected = files && files[0] ? files[0] : null;
      setResourceForm((prev) => ({
        ...prev,
        file: selected,
        fileUrl: selected ? selected.name : prev.fileUrl,
      }));
      return;
    }

    setResourceForm((prev) => ({ ...prev, [name]: value }));
  }

  function validateFileType(fileName) {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";
    return ALLOWED_FILE_TYPES.includes(extension);
  }

  async function handleResourceSubmit(event) {
    event.preventDefault();

    if (!resourceForm.title || !resourceForm.category || !resourceForm.description || !resourceForm.fileUrl) {
      alert("Please fill all resource fields before submitting.");
      return;
    }

    if (!validateFileType(resourceForm.fileUrl)) {
      alert(`Invalid file type. Allowed: ${ALLOWED_FILE_TYPES.join(", ")}`);
      return;
    }

    const payload = {
      title: resourceForm.title,
      category: resourceForm.category,
      description: resourceForm.description,
      fileUrl: resourceForm.fileUrl,
    };

    try {
      const response = await fetch(`${API_BASE}/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Resource save failed");
      }

      const saved = await response.json();
      setResources((prev) => [{ ...saved, completed: false }, ...prev]);
    } catch (error) {
      alert("Unable to save resource. Please ensure backend is running.");
      return;
    }

    setResourceForm({ title: "", category: "", description: "", fileUrl: "", file: null });
  }

  async function markAsFinished(resourceId) {
    const creditGain = 10;
    const newCredits = totalCredits + creditGain;

    const payload = {
      studentId: "STU-2026-001",
      totalCredits: newCredits,
    };

    try {
      const response = await fetch(`${API_BASE}/credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Credit update failed");
      }

      setResources((prev) =>
        prev.map((resource) =>
          resource.id === resourceId ? { ...resource, completed: true } : resource
        )
      );
      setTotalCredits(newCredits);
    } catch (error) {
      alert("Unable to update credits. Please ensure backend is running.");
    }
  }

  function handleReviewInput(event) {
    const { name, value } = event.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleReviewSubmit(event) {
    event.preventDefault();

    if (!reviewForm.resourceId || !reviewForm.feedbackText.trim()) {
      alert("Please select a resource and add feedback before submitting.");
      return;
    }

    const payload = {
      resourceId: Number(reviewForm.resourceId),
      rating: Number(reviewForm.rating),
      feedbackText: reviewForm.feedbackText.trim(),
    };

    try {
      const response = await fetch(`${API_BASE}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Review save failed");
      }

      const saved = await response.json();
      setReviews((prev) => [saved, ...prev]);
    } catch (error) {
      alert("Unable to save review. Please ensure backend is running.");
      return;
    }

    setReviewForm({ resourceId: "", rating: 5, feedbackText: "" });
  }

  function reportReview(reviewId) {
    alert(`Review #${reviewId} has been flagged for moderation.`);
  }

  return (
    <div className="min-h-screen pb-10 text-slate-800">
      <header className="relative overflow-hidden bg-cyan-900 px-6 py-10 text-white shadow-glow">
        <div className="absolute -left-10 -top-14 h-40 w-40 rounded-full bg-orange-300/30 blur-2xl" />
        <div className="absolute -bottom-10 right-10 h-40 w-40 rounded-full bg-sky-300/30 blur-2xl" />
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-100">university assignment demo</p>
          <h1 className="font-display text-3xl font-extrabold md:text-5xl">Smart Learning Management Platform</h1>
          <p className="mt-3 max-w-3xl text-sm text-cyan-50 md:text-base">
            Resource Management, Credit Awarding System, and Review & Rating Management with live database-driven data.
          </p>
        </div>
      </header>

      <aside className="fixed right-4 top-4 z-20 rounded-2xl border border-cyan-200 bg-white px-5 py-4 shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-700">credits</p>
        <p className="font-display text-3xl font-extrabold text-cyan-900">{totalCredits}</p>
        <p className="text-xs capitalize text-slate-500">status: {backendStatus}</p>
      </aside>

      <main className="mx-auto mt-8 grid max-w-6xl gap-6 px-4 md:grid-cols-2">
        <section className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-lg">
          <h2 className="font-display text-2xl font-bold text-cyan-900">Resource Management</h2>
          <p className="mb-4 text-sm lowercase text-slate-600">upload and display learning materials</p>

          <form onSubmit={handleResourceSubmit} className="space-y-3">
            <label className="block text-xs uppercase tracking-wide text-slate-600">
              title
              <input
                name="title"
                value={resourceForm.title}
                onChange={handleResourceInput}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm capitalize"
                placeholder="e.g. itpm chapter 3"
              />
            </label>

            <label className="block text-xs uppercase tracking-wide text-slate-600">
              category
              <input
                name="category"
                value={resourceForm.category}
                onChange={handleResourceInput}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm capitalize"
                placeholder="e.g. project management"
              />
            </label>

            <label className="block text-xs uppercase tracking-wide text-slate-600">
              description
              <textarea
                name="description"
                value={resourceForm.description}
                onChange={handleResourceInput}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                rows={3}
                placeholder="short summary of this resource"
              />
            </label>

            <label className="block text-xs uppercase tracking-wide text-slate-600">
              upload file
              <input
                type="file"
                name="file"
                onChange={handleResourceInput}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            <label className="block text-xs uppercase tracking-wide text-slate-600">
              file url or name
              <input
                name="fileUrl"
                value={resourceForm.fileUrl}
                onChange={handleResourceInput}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm lowercase"
                placeholder="itpm-chapter-3.pdf"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white hover:bg-cyan-800"
              >
                Submit
              </button>
            </div>
          </form>

          <div className="mt-5 space-y-3">
            {sortedResources.map((resource) => (
              <article key={resource.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold capitalize">{resource.title}</h3>
                    <p className="text-xs uppercase tracking-wide text-cyan-700">{resource.category}</p>
                    <p className="mt-1 text-sm text-slate-700">{resource.description}</p>
                    <a href="#/" className="mt-1 block text-xs lowercase text-cyan-700 underline">
                      {resource.fileUrl}
                    </a>
                  </div>
                  <button
                    type="button"
                    disabled={resource.completed}
                    onClick={() => markAsFinished(resource.id)}
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:bg-emerald-300"
                  >
                    {resource.completed ? "Finished" : "Mark as Finished"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-amber-100 bg-white p-6 shadow-lg">
          <h2 className="font-display text-2xl font-bold text-amber-700">Review & Rating Management</h2>
          <p className="mb-4 text-sm lowercase text-slate-600">leave 1-5 star ratings and feedback on resources</p>

          <form onSubmit={handleReviewSubmit} className="space-y-3">
            <label className="block text-xs uppercase tracking-wide text-slate-600">
              resource
              <select
                name="resourceId"
                value={reviewForm.resourceId}
                onChange={handleReviewInput}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm capitalize"
              >
                <option value="">select a resource</option>
                {sortedResources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs uppercase tracking-wide text-slate-600">
              rating
              <select
                name="rating"
                value={reviewForm.rating}
                onChange={handleReviewInput}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <option key={star} value={star}>
                    {star} star{star > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs uppercase tracking-wide text-slate-600">
              feedback
              <textarea
                name="feedbackText"
                value={reviewForm.feedbackText}
                onChange={handleReviewInput}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                rows={3}
                placeholder="share your experience with this resource"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white hover:bg-amber-700"
              >
                Submit
              </button>
            </div>
          </form>

          <div className="mt-5 space-y-3">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold uppercase text-amber-800">
                    resource #{review.resourceId}
                  </p>
                  <p className="text-base font-bold text-amber-700">{"★".repeat(Number(review.rating || 0))}</p>
                </div>
                <p className="mt-2 text-sm text-slate-700">{review.feedbackText}</p>
                <button
                  type="button"
                  onClick={() => reportReview(review.id)}
                  className="mt-3 rounded-md border border-rose-300 px-3 py-1 text-xs font-bold uppercase tracking-wide text-rose-700 hover:bg-rose-100"
                >
                  Report
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
