"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Bot, Cpu, Zap, Droplets, Trash2, Wind, Users, 
  Building2, Box, AlertTriangle, Lightbulb, Sliders, CheckSquare, 
  TrendingUp, FileText, ShieldAlert, Sparkles,
  GitBranch, Beaker, CloudRain, Recycle, DollarSign,
  AlertOctagon, Target, Trophy, BookOpen,
  Activity, TestTube2, Waves, Radio, PhoneCall
} from 'lucide-react';

export const navItems = [
  { name: 'Command Center', href: '/dashboard', icon: LayoutDashboard },
  { name: 'EcoCore Supervisor', href: '/agent', icon: Bot, badge: 'Main AI' },
  { name: 'Agent Fleet', href: '/agents', icon: Cpu },
  { name: 'Digital Twin', href: '/digital-twin', icon: Box },
  { name: 'Anomaly Center', href: '/anomalies', icon: AlertTriangle, badgeColor: 'bg-rose-500/20 text-rose-400' },
  { name: 'Recommendations', href: '/recommendations', icon: Lightbulb },
  { name: 'What-If Lab', href: '/simulation', icon: Sliders },
  { name: 'Approvals & Gate', href: '/approvals', icon: CheckSquare, badge: 'Gov' },
  { name: 'Verified Impact', href: '/impact', icon: TrendingUp },
  { name: 'AI Reports', href: '/reports', icon: FileText },
  { type: 'divider', title: 'Telemetry Streams' },
  { name: 'Energy Intelligence', href: '/energy', icon: Zap },
  { name: 'Water & Leaks', href: '/water', icon: Droplets },
  { name: 'Waste & Circularity', href: '/waste', icon: Trash2 },
  { name: 'Air & Ventilation', href: '/air-quality', icon: Wind },
  { name: 'Occupancy & Space', href: '/occupancy', icon: Users },
  { name: 'Facility Directory', href: '/facilities', icon: Building2 },
  { type: 'divider', title: 'Water Intelligence' },
  { name: 'Calling Board', href: '/water/calling-board', icon: PhoneCall, badge: 'Live', badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
  { name: 'Water Digital Twin', href: '/water/digital-twin', icon: Waves },
  { name: 'Leak Detection AI', href: '/water/leak-detection', icon: AlertOctagon, badgeColor: 'bg-rose-500/20 text-rose-400' },
  { name: 'Efficiency Score', href: '/water/efficiency', icon: Activity },
  { name: 'Rainwater Harvest', href: '/water/rainwater', icon: CloudRain },
  { name: 'Greywater Reuse', href: '/water/greywater', icon: Recycle },
  { name: 'Cost Simulator', href: '/water/cost-simulator', icon: DollarSign },
  { name: 'Shortage Predict', href: '/water/shortage', icon: AlertTriangle },
  { name: 'Sensor Health', href: '/water/sensor-health', icon: Radio },
  { name: 'Root Cause AI', href: '/water/root-cause', icon: GitBranch },
  { name: 'Cross-Resource', href: '/water/cross-resource', icon: Beaker },
  { name: 'Water Quality', href: '/water/quality', icon: TestTube2 },
  { name: 'Smart Alerts', href: '/water/alerts', icon: ShieldAlert, badge: 'New' },
  { name: 'Goals Tracker', href: '/water/goals', icon: Target },
  { name: 'Leaderboard', href: '/water/leaderboard', icon: Trophy },
  { name: 'AI Reports', href: '/water/report', icon: BookOpen },
  { name: 'Activity Timeline', href: '/water/timeline', icon: GitBranch },
  { name: 'Verified Impact', href: '/water/impact', icon: TrendingUp },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0a0f1d] border-r border-[#1a233a] flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-[#1a233a] bg-[#0d1427]">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Sparkles className="w-5 h-5 text-slate-950" />
        </div>
        <div>
          <div className="font-bold text-base tracking-wide text-white flex items-center gap-1.5">
            EcoGenius
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">AI</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Sustainability HQ</p>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {navItems.map((item, idx) => {
          if (item.type === 'divider') {
            return (
              <div key={idx} className="pt-4 pb-1 px-3 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                {item.title}
              </div>
            );
          }
          const Icon = item.icon as any;
          const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/10 text-cyan-300 border border-cyan-500/30 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#121b33]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                  item.badgeColor || 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Status */}
      <div className="p-3 border-t border-[#1a233a] bg-[#0c1224]">
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#121a30] border border-[#1e2a4a]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-medium text-slate-300">12 Agents Active</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold">99.2% Health</span>
        </div>
      </div>
    </aside>
  );
}
