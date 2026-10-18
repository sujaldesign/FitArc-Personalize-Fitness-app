import React from "react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Dumbbell,
  Flame,
  HeartPulse,
  Moon,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Home from "@/pages/Home";
import Calories from "@/pages/Calories";
import Exercise from "@/pages/Exercise";
import Health from "@/pages/Health";
import Sleep from "@/pages/Sleep";
import Recovery from "@/pages/Recovery";

const navigation = [
  { to: "/", label: "Overview", icon: BarChart3, end: true },
  { to: "/calories", label: "Nutrition", icon: Flame },
  { to: "/exercise", label: "Workouts", icon: Dumbbell },
  { to: "/health", label: "Health metrics", icon: HeartPulse },
  { to: "/sleep", label: "Sleep", icon: Moon },
  { to: "/recovery", label: "Recovery", icon: Activity },
];

function SidebarLink({ item, onNavigate }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
      <span>{item.label}</span>
    </NavLink>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  return (
    <div className="app-shell min-h-screen">
      <aside className="sidebar">
        <NavLink to="/" className="brand" aria-label="FitArc home" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark"><Activity className="h-6 w-6" /></span>
          <span>
            <span className="block text-xl font-bold tracking-tight">FitArc</span>
            <span className="block text-[11px] font-medium tracking-[0.16em] text-slate-400">FITNESS OS</span>
          </span>
        </NavLink>
        <div className="mt-9 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</div>
        <nav className="mt-3 flex flex-col gap-1" aria-label="Main navigation">
          {navigation.map((item) => <SidebarLink key={item.to} item={item} onNavigate={() => setMenuOpen(false)} />)}
        </nav>
        <div className="sidebar-footer">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300"><ShieldCheck className="h-5 w-5" /></div>
          <p className="text-sm font-semibold text-white">Your data stays local</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">Fitness logs are stored in this browser. Export or clear data from your browser settings.</p>
        </div>
      </aside>

      {menuOpen && <button aria-label="Close navigation menu" className="mobile-scrim" onClick={() => setMenuOpen(false)} />}
      <div className={`mobile-sidebar ${menuOpen ? "mobile-sidebar-open" : ""}`}>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-white">Menu</span>
          <button className="rounded-lg p-2 text-slate-300 hover:bg-white/10" onClick={() => setMenuOpen(false)} aria-label="Close menu">✕</button>
        </div>
        <nav className="mt-4 flex flex-col gap-1" aria-label="Mobile navigation">
          {navigation.map((item) => <SidebarLink key={item.to} item={item} onNavigate={() => setMenuOpen(false)} />)}
        </nav>
      </div>

      <main className="main-panel">
        <header className="topbar">
          <button className="menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Open navigation menu">☰</button>
          <div className="flex items-center gap-2 text-sm text-slate-500"><Sparkles className="h-4 w-4 text-emerald-600" /><span>Small steps. Stronger you.</span></div>
          <div className="ml-auto flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Personal dashboard</div>
        </header>
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calories" element={<Calories />} />
            <Route path="/exercise" element={<Exercise />} />
            <Route path="/health" element={<Health />} />
            <Route path="/sleep" element={<Sleep />} />
            <Route path="/recovery" element={<Recovery />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <footer className="mt-10 border-t border-slate-200/80 pt-5 text-xs text-slate-400">FitArc · Track. Improve. Thrive. <span className="mx-1">•</span> Personal wellness tracker</footer>
        </div>
      </main>
    </div>
  );
}
