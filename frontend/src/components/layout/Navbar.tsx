"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Shield, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [session, setSession] = useState<{ uniqueId: string; name: string; email: string } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("eco_session");
    if (raw) {
      try { setSession(JSON.parse(raw)); } catch { }
    }
  }, []);

  const handleTriggerDemo = () => {
    setIsDemoRunning(true);
    router.push('/agent?demo=true');
    setTimeout(() => setIsDemoRunning(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem("eco_session");
    router.push('/login');
  };

  const initials = session?.name
    ? session.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'EG';

  return (
    <header className="h-16 bg-[#0a0f1d]/90 backdrop-blur-md border-b border-[#1a233a] fixed top-0 right-0 left-64 z-20 px-6 flex items-center justify-between">
      {/* Title / Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Live Autonomous Telemetry
          </span>
        </div>
      </div>

      {/* Action Center */}
      <div className="flex items-center gap-3">
        {/* Signature 1-Click Demo Trigger */}
        <button
          onClick={handleTriggerDemo}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/25 transition-all duration-150 active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Launch Signature Demo (Bldg B Water Leak)</span>
        </button>

        <Link
          href="/approvals"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141d36] hover:bg-[#1b2647] border border-[#233157] text-slate-300 text-xs font-medium"
        >
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>Governance Gate</span>
          <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 text-[10px] flex items-center justify-center font-bold">1</span>
        </Link>

        {/* Profile + Logout */}
        <div className="flex items-center gap-2 pl-3 border-l border-[#1a233a]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow">
            {initials}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-medium text-slate-200">{session?.name || 'Guest User'}</div>
            <div className="text-[10px] text-slate-400">{session?.uniqueId || 'ID: —'}</div>
          </div>
          <button
            id="navbar-logout-btn"
            onClick={handleLogout}
            title="Sign Out"
            className="ml-1 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
