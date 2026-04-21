import { useCallback, useEffect, useState } from "react";

const API_BASE = "http://localhost:8086/api";

export default function StudySessionPage() {
  const [sessions, setSessions] = useState([]);
  const [backendStatus, setBackendStatus] = useState("Connecting...");
  const [viewMode, setViewMode] = useState("upcoming"); // "upcoming" | "all"
  
  // 1. Add a state to hold the dynamically fetched user
  const [currentUser, setCurrentUser] = useState(null);

  // 2. Fetch the current user when the component mounts
  useEffect(() => {
    // Retrieving the user object saved by the Login component
    const storedUser = localStorage.getItem("user"); 
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser.username); 
      } catch (err) {
        console.error("Failed to parse user data", err);
      }
    }
  }, []);

  const loadSessions = useCallback(async () => {
    try {
      const endpoint = viewMode === "upcoming"
        ? `${API_BASE}/sessions/upcoming`
        : `${API_BASE}/sessions`;
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error();
      setSessions(await res.json());
      setBackendStatus("Online: API connected");
    } catch { setBackendStatus("Offline: backend unavailable"); }
  }, [viewMode]);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  async function handleJoin(sessionId) {
    if (!currentUser) {
      alert("Please log in to join a session.");
      return;
    }

    try {
      // 3. Use the dynamic currentUser here
      const res = await fetch(`${API_BASE}/sessions/${sessionId}/join?userId=${currentUser}`, { method: "POST" });
      if (res.ok) { 
        const updated = await res.json(); 
        setSessions(prev => prev.map(s => s.id === updated.id ? updated : s)); 
      }
    } catch { /* offline */ }
  }

  async function handleLeave(sessionId) {
    if (!currentUser) return;

    try {
      // 3. Use the dynamic currentUser here
      const res = await fetch(`${API_BASE}/sessions/${sessionId}/leave?userId=${currentUser}`, { method: "POST" });
      if (res.ok) { 
        const updated = await res.json(); 
        setSessions(prev => prev.map(s => s.id === updated.id ? updated : s)); 
      }
    } catch { /* ignore */ }
  }

  function isJoined(session) {
    if (!session.attendees || !currentUser) return false;
    // 3. Use the dynamic currentUser here
    return session.attendees.split(",").includes(currentUser);
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

  return (
    <main className="mx-auto mt-6 max-w-6xl px-4 pb-10 text-slate-800 mt-[10vh]">
      <section className="rounded-2xl border border-sky-100 bg-white p-6 shadow-lg">
        {/* Header */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl font-bold text-sky-800">Study Support Sessions</h2>
            <p className="text-sm text-slate-500">
              {currentUser ? `View and join live sessions as ${currentUser}` : "Log in to view and join live sessions with tutors and peers"}
            </p>
          </div>
          <p className="rounded-md bg-sky-50 px-3 py-1 text-xs text-sky-800">{backendStatus}</p>
        </div>

        {/* View toggle */}
        <div className="mb-5 flex gap-2">
          {[["upcoming","📅 Upcoming"],["all","📋 All Sessions"]].map(([mode, label]) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                viewMode === mode ? "bg-sky-600 text-white" : "bg-sky-50 text-sky-800 hover:bg-sky-100"
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Sessions grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {sessions.map(session => {
            const joined = isJoined(session);
            const count = attendeeCount(session);
            return (
              <article key={session.id} className="rounded-xl border border-sky-100 bg-sky-50 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sky-900">{session.title}</h3>
                  <span className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase ${statusStyle[session.status] || "bg-slate-100 text-slate-500"}`}>
                    {session.status}
                  </span>
                </div>

                {session.description && (
                  <p className="mt-1 text-sm text-slate-600">{session.description}</p>
                )}

                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                  {session.sessionDate && <span>📅 {session.sessionDate}</span>}
                  {session.sessionTime && <span>🕐 {session.sessionTime}</span>}
                  {session.createdBy && <span>👤 {session.createdBy}</span>}
                  <span>👥 {count} attendee{count !== 1 ? "s" : ""}</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 items-center">
                  {joined ? (
                    <>
                      <a href={session.meetingLink} target="_blank" rel="noreferrer"
                        className="rounded bg-sky-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-700">
                        🔗 Join Meeting
                      </a>
                      <button onClick={() => handleLeave(session.id)}
                        className="rounded border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 transition-colors">
                        Leave
                      </button>
                      <span className="rounded bg-emerald-100 px-2 py-1.5 text-xs font-semibold text-emerald-700 ml-auto">✓ Registered</span>
                    </>
                  ) : (
                    <button 
                      onClick={() => handleJoin(session.id)}
                      disabled={!currentUser}
                      className="rounded bg-sky-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors">
                      {currentUser ? "✋ Join Session" : "Log in to Join"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
          {sessions.length === 0 && (
            <p className="col-span-2 py-12 text-center text-sm text-slate-400">
              {viewMode === "upcoming" ? "No upcoming sessions scheduled." : "No sessions found."}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}