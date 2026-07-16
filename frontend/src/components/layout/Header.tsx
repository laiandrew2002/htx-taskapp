import { NavLink } from "react-router-dom";

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  ].join(" ");

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div>
          <p className="text-lg font-semibold text-slate-900">Task Manager</p>
          <p className="text-xs text-slate-500">Developer task assignment</p>
        </div>
        <nav className="flex items-center gap-2">
          <NavLink to="/" end className={linkClassName}>
            Task List
          </NavLink>
          <NavLink to="/tasks/new" className={linkClassName}>
            Create Task
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
