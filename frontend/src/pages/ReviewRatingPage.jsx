import { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:8086/api";
const CURRENT_USER = "STU-2026-001";
const FEEDBACK_MIN = 10;
const FEEDBACK_MAX = 400;

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
      ⚠ {msg}
    </p>
  );
}
function inputCls(hasError) {
  return `mt-1 w-full rounded-lg border px-3 py-2 text-sm ${
    hasError
      ? "border-red-400 bg-red-50 focus:ring-1 focus:ring-red-400 focus:outline-none"
      : "border-slate-200 focus:ring-1 focus:ring-amber-400 focus:outline-none"
  }`;
}

export default function ReviewRatingPage() {
  const [resources, setResources] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [backendStatus, setBackendStatus] = useState("Connecting...");
  const [reviewForm, setReviewForm] = useState({
    resourceId: "",
    rating: 5,
    feedbackText: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [editingReview, setEditingReview] = useState(null);
  const [editErrors, setEditErrors] = useState({});

  const loadData = useCallback(async () => {
    try {
      const [rRes, rvRes] = await Promise.all([
        fetch(`${API_BASE}/resources`),
        fetch(`${API_BASE}/reviews`),
      ]);
      if (rRes.ok) setResources(await rRes.json());
      if (rvRes.ok) setReviews(await rvRes.json());
      setBackendStatus("Online: API connected");
    } catch {
      setBackendStatus("Offline: using local fallback");
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const sortedResources = useMemo(
    () => [...resources].sort((a, b) => Number(b.id) - Number(a.id)),
    [resources]
  );
  const sortedReviews = useMemo(
    () => [...reviews].sort((a, b) => Number(b.id) - Number(a.id)),
    [reviews]
  );

  function handleReviewInput(e) {
    const { name, value } = e.target;
    setReviewForm((p) => ({ ...p, [name]: value }));
    if (formErrors[name])
      setFormErrors((p) => {
        const n = { ...p };
        delete n[name];
        return n;
      });
  }

  function validateSubmitForm() {
    const e = {};
    const feedback = reviewForm.feedbackText.trim();
    const rating = Number(reviewForm.rating);

    if (!reviewForm.resourceId) e.resourceId = "Please select a resource.";
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      e.rating = "Rating must be between 1 and 5.";
    if (!feedback) e.feedbackText = "Feedback is required.";
    else if (feedback.length < FEEDBACK_MIN)
      e.feedbackText = `Feedback must be at least ${FEEDBACK_MIN} characters.`;
    else if (feedback.length > FEEDBACK_MAX)
      e.feedbackText = `Feedback must be ${FEEDBACK_MAX} characters or fewer.`;

    setFormErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateEditForm() {
    const e = {};
    const feedback = editingReview.feedbackText.trim();
    const rating = Number(editingReview.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      e.rating = "Rating must be 1–5.";
    if (!feedback) e.feedbackText = "Feedback is required.";
    else if (feedback.length < FEEDBACK_MIN)
      e.feedbackText = `Feedback must be at least ${FEEDBACK_MIN} characters.`;
    else if (feedback.length > FEEDBACK_MAX)
      e.feedbackText = `Feedback must be ${FEEDBACK_MAX} characters or fewer.`;

    setEditErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!validateSubmitForm()) return;
    const payload = {
      resourceId: Number(reviewForm.resourceId),
      rating: Number(reviewForm.rating),
      feedbackText: reviewForm.feedbackText.trim(),
      userId: CURRENT_USER,
    };
    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      const saved = await res.json();
      setReviews((prev) => [saved, ...prev]);
      setBackendStatus("Online: API connected");
      setReviewForm({ resourceId: "", rating: 5, feedbackText: "" });
      setFormErrors({});
    } catch {
      const local = { id: Date.now(), ...payload };
      setReviews((prev) => [local, ...prev]);
      setBackendStatus("Offline: using local fallback");
      setReviewForm({ resourceId: "", rating: 5, feedbackText: "" });
      setFormErrors({});
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this review?")) return;
    try {
      await fetch(`${API_BASE}/reviews/${id}`, { method: "DELETE" });
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setReviews((prev) => prev.filter((r) => r.id !== id));
    }
  }

  async function handleEditSave() {
    if (!validateEditForm()) return;
    const feedback = editingReview.feedbackText.trim();
    const rating = Number(editingReview.rating);
    try {
      const res = await fetch(`${API_BASE}/reviews/${editingReview.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, feedbackText: feedback }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setReviews((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
      setEditingReview(null);
      setEditErrors({});
    } catch {
      alert("Update failed.");
    }
  }

  function getResourceTitle(id) {
    return resources.find((r) => r.id === Number(id))?.title || `Resource #${id}`;
  }

  return (
    <main className="mx-auto mt-6 max-w-6xl px-4 pb-10 text-slate-800 mt-[10vh] ">
      {/* Edit Review Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold text-amber-700">Edit Review</h3>

            <div className="mb-3">
              <label className="block text-xs uppercase tracking-wide text-slate-600">
                Rating <span className="text-red-500">*</span>
              </label>
              <select
                value={editingReview.rating}
                onChange={(e) => {
                  setEditingReview((p) => ({ ...p, rating: e.target.value }));
                  if (editErrors.rating)
                    setEditErrors((p) => ({ ...p, rating: null }));
                }}
                className={inputCls(!!editErrors.rating)}
              >
                {[1, 2, 3, 4, 5].map((s) => (
                  <option key={s} value={s}>
                    {s} Star{s > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
              <FieldError msg={editErrors.rating} />
            </div>

            <div className="mb-4">
              <label className="block text-xs uppercase tracking-wide text-slate-600">
                Feedback <span className="text-red-500">*</span>
              </label>
              <textarea
                value={editingReview.feedbackText}
                onChange={(e) => {
                  setEditingReview((p) => ({ ...p, feedbackText: e.target.value }));
                  if (editErrors.feedbackText)
                    setEditErrors((p) => ({ ...p, feedbackText: null }));
                }}
                rows={3}
                maxLength={FEEDBACK_MAX}
                className={inputCls(!!editErrors.feedbackText)}
              />
              <div className="flex justify-between items-start">
                <FieldError msg={editErrors.feedbackText} />
                <span
                  className={`text-[11px] ${
                    editingReview.feedbackText.length < FEEDBACK_MIN
                      ? "text-amber-500"
                      : "text-slate-400"
                  }`}
                >
                  {editingReview.feedbackText.length}/{FEEDBACK_MAX}
                  {editingReview.feedbackText.length < FEEDBACK_MIN &&
                    ` (min ${FEEDBACK_MIN})`}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleEditSave}
                className="flex-1 rounded-lg bg-amber-600 py-2 text-sm font-bold text-white hover:bg-amber-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingReview(null);
                  setEditErrors({});
                }}
                className="flex-1 rounded-lg border py-2 text-sm hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="rounded-2xl border border-amber-100 bg-white p-6 shadow-lg">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl font-bold text-amber-700">
              Review and Rating
            </h2>
            <p className="text-sm text-slate-500">
              Leave feedback and manage your reviews
            </p>
          </div>
          <p className="rounded-md bg-amber-50 px-3 py-1 text-xs text-amber-800">
            {backendStatus}
          </p>
        </div>

        {/* Submit Review Form */}
        <form onSubmit={handleReviewSubmit} className="space-y-3" noValidate>
          <div>
            <label className="block text-xs uppercase tracking-wide text-slate-600">
              Resource <span className="text-red-500">*</span>
            </label>
            <select
              name="resourceId"
              value={reviewForm.resourceId}
              onChange={handleReviewInput}
              className={`${inputCls(!!formErrors.resourceId)} capitalize`}
            >
              <option value="">Select a Resource</option>
              {sortedResources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
            <FieldError msg={formErrors.resourceId} />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-slate-600">
              Rating <span className="text-red-500">*</span>
            </label>
            <select
              name="rating"
              value={reviewForm.rating}
              onChange={handleReviewInput}
              className={inputCls(!!formErrors.rating)}
            >
              {[1, 2, 3, 4, 5].map((s) => (
                <option key={s} value={s}>
                  {s} Star{s > 1 ? "s" : ""}
                </option>
              ))}
            </select>
            <FieldError msg={formErrors.rating} />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-slate-600">
              Feedback <span className="text-red-500">*</span>
            </label>
            <textarea
              name="feedbackText"
              value={reviewForm.feedbackText}
              onChange={handleReviewInput}
              rows={3}
              placeholder="Share your experience…"
              maxLength={FEEDBACK_MAX}
              className={inputCls(!!formErrors.feedbackText)}
            />
            <div className="flex justify-between items-start">
              <FieldError msg={formErrors.feedbackText} />
              <span
                className={`text-[11px] ${
                  reviewForm.feedbackText.length < FEEDBACK_MIN &&
                  reviewForm.feedbackText.length > 0
                    ? "text-amber-500"
                    : "text-slate-400"
                }`}
              >
                {reviewForm.feedbackText.length}/{FEEDBACK_MAX}
                {reviewForm.feedbackText.length > 0 &&
                  reviewForm.feedbackText.length < FEEDBACK_MIN &&
                  ` (min ${FEEDBACK_MIN})`}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-amber-600 px-5 py-2 text-sm font-bold text-white hover:bg-amber-700"
          >
            Submit Review
          </button>
        </form>

        {/* Reviews List */}
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {sortedReviews.map((review) => {
            const isOwn = review.userId === CURRENT_USER || !review.userId;
            return (
              <article
                key={review.id}
                className="rounded-xl border border-amber-100 bg-amber-50 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold uppercase text-amber-800">
                      {getResourceTitle(review.resourceId)}
                    </p>
                    <p className="text-base font-bold text-amber-600">
                      {"★".repeat(Number(review.rating || 0))}
                      {"☆".repeat(5 - Number(review.rating || 0))}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {review.userId && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">
                        {review.userId}
                      </span>
                    )}
                    {review.createdAt && (
                      <span className="text-[10px] text-slate-400">
                        {new Date(review.createdAt).toLocaleDateString("en-GB")}
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-700">{review.feedbackText}</p>
                {isOwn && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() =>
                        setEditingReview({
                          id: review.id,
                          rating: review.rating,
                          feedbackText: review.feedbackText,
                        })
                      }
                      className="rounded border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                    >
                      ✏ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="rounded border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                    >
                      🗑 Delete
                    </button>
                  </div>
                )}
              </article>
            );
          })}
          {sortedReviews.length === 0 && (
            <p className="col-span-2 py-10 text-center text-sm text-slate-400">
              No reviews yet. Be the first to leave one!
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
