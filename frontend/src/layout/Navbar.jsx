import { NavLink } from "react-router-dom";

export default function Navbar() {
  const baseLink =
    "rounded-md px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] transition-colors";

  return (
    <nav className="sticky top-0 z-40 border-b border-cyan-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <h1 className="font-display text-lg font-extrabold uppercase tracking-[0.2em] text-cyan-900">
          Smart Learning Platform
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <NavLink
            to="/resources"
            className={({ isActive }) => `${baseLink} ${isActive ? "bg-cyan-700 text-white" : "bg-cyan-50 text-cyan-900 hover:bg-cyan-100"}`}
          >
            Resource Management
          </NavLink>
          <NavLink
            to="/credits"
            className={({ isActive }) => `${baseLink} ${isActive ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-900 hover:bg-emerald-100"}`}
          >
            Credit Awarding
          </NavLink>
          <NavLink
            to="/reviews"
            className={({ isActive }) => `${baseLink} ${isActive ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-900 hover:bg-amber-100"}`}
          >
            Review and Rating
          </NavLink>
        </div>
      </div>
    </nav>
  );
}