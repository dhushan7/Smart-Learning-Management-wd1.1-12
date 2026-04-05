import { NavLink } from "react-router-dom";

export default function Navbar() {
  const studentLink = (active) =>
    `rounded-md px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] transition-colors ${
      active ? "bg-cyan-700 text-white" : "bg-cyan-50 text-cyan-900 hover:bg-cyan-100"
    }`;

  const adminLink = (active) =>
    `rounded-md px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] transition-colors ${
      active ? "bg-violet-700 text-white" : "bg-violet-100 text-violet-900 hover:bg-violet-200"
    }`;

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
      <div className="mx-auto max-w-6xl px-4 py-3">
        {/* Brand */}
        <div className="mb-2 flex items-center justify-between">
          <h1 className="font-display text-lg font-extrabold uppercase tracking-[0.2em] text-cyan-900">
            Smart Learning Platform
          </h1>
        </div>

        {/* Two nav rows */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {/* Student links */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Student
            </span>
            <NavLink
              to="/resources"
              className={({ isActive }) => studentLink(isActive)}
            >
              Resources
            </NavLink>
            <NavLink
              to="/credits"
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] transition-colors ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                }`
              }
            >
              Credits
            </NavLink>
            <NavLink
              to="/reviews"
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] transition-colors ${
                  isActive
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 text-amber-900 hover:bg-amber-100"
                }`
              }
            >
              Reviews
            </NavLink>
            <NavLink
              to="/sessions"
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] transition-colors ${
                  isActive
                    ? "bg-sky-600 text-white"
                    : "bg-sky-50 text-sky-900 hover:bg-sky-100"
                }`
              }
            >
              Sessions
            </NavLink>
          </div>

          {/* Divider */}
          <span className="hidden h-6 w-px bg-slate-200 sm:block" />

          {/* Admin links */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">
              ⚙ Admin
            </span>
            <NavLink
              to="/admin/resources"
              className={({ isActive }) => adminLink(isActive)}
            >
              Resources
            </NavLink>
            <NavLink
              to="/admin/credits"
              className={({ isActive }) => adminLink(isActive)}
            >
              Credits
            </NavLink>
            <NavLink
              to="/admin/sessions"
              className={({ isActive }) => adminLink(isActive)}
            >
              Sessions
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}