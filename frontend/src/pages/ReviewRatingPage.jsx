import { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:8080/api";
const FEEDBACK_MIN = 10;
const FEEDBACK_MAX = 400;

export default function ReviewRatingPage() {
  const [resources, setResources] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [backendStatus, setBackendStatus] = useState("Connecting...");
  const [reviewForm, setReviewForm] = useState({
    resourceId: "",
    rating: 5,
    feedbackText: "",
  });

  const loadData = useCallback(async () => {
    await Promise.all([loadResources(), loadReviews()]);
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

  async function loadReviews() {
    try {
      const response = await fetch(`${API_BASE}/reviews`);
      if (!response.ok) {
        throw new Error("Review API failed");
      }
      const data = await response.json();
      setReviews(data || []);
    } catch (error) {
      setReviews((prev) => prev);
    }
  }

  function handleReviewInput(event) {
    const { name, value } = event.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  }

  function validateReviewForm() {
    const feedback = reviewForm.feedbackText.trim();
    const rating = Number(reviewForm.rating);

    if (!reviewForm.resourceId) {
      return "Please select a resource before submitting.";
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return "Rating must be between 1 and 5.";
    }

    if (feedback.length < FEEDBACK_MIN || feedback.length > FEEDBACK_MAX) {
      return `Feedback must be between ${FEEDBACK_MIN} and ${FEEDBACK_MAX} characters.`;
    }

    return null;
  }

  async function handleReviewSubmit(event) {
    event.preventDefault();

    const validationMessage = validateReviewForm();
    if (validationMessage) {
      alert(validationMessage);
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
      setBackendStatus("Online: API connected");
      setReviewForm({ resourceId: "", rating: 5, feedbackText: "" });
    } catch (error) {
      const localReview = {
        id: Date.now(),
        resourceId: Number(reviewForm.resourceId),
        rating: Number(reviewForm.rating),
        feedbackText: reviewForm.feedbackText.trim(),
      };
      setReviews((prev) => [localReview, ...prev]);
      setBackendStatus("Offline: using local fallback");
      setReviewForm({ resourceId: "", rating: 5, feedbackText: "" });
      alert("Backend unavailable. Review added to local state for demo continuity.");
    }
  }

  function reportReview(reviewId) {
    if (window.confirm(`Are you sure you want to report review #${reviewId}?`)) {
      alert(`Review #${reviewId} has been flagged for moderation.`);
    }
  }

  return (
    <main className="mx-auto mt-6 max-w-6xl px-4 pb-10 text-slate-800">
      <section className="rounded-2xl border border-amber-100 bg-white p-6 shadow-lg">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl font-bold text-amber-700">Review and Rating Management</h2>
            <p className="text-sm text-slate-600">Leave 1-5 star ratings and feedback on resources</p>
          </div>
          <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">Status: {backendStatus}</p>
        </div>

        <form onSubmit={handleReviewSubmit} className="space-y-3">
          <label className="block text-xs uppercase tracking-wide text-slate-600">
            Resource
            <select
              name="resourceId"
              value={reviewForm.resourceId}
              onChange={handleReviewInput}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm capitalize"
              required
            >
              <option value="">Select a Resource</option>
              {sortedResources.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs uppercase tracking-wide text-slate-600">
            Rating
            <select
              name="rating"
              value={reviewForm.rating}
              onChange={handleReviewInput}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              required
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <option key={star} value={star}>
                  {star} Star{star > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs uppercase tracking-wide text-slate-600">
            Feedback
            <textarea
              name="feedbackText"
              value={reviewForm.feedbackText}
              onChange={handleReviewInput}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={3}
              placeholder="Share your experience with this resource"
              required
              minLength={FEEDBACK_MIN}
              maxLength={FEEDBACK_MAX}
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

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {sortedReviews.map((review) => (
            <article key={review.id} className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold uppercase text-amber-800">resource #{review.resourceId}</p>
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
  );
}
