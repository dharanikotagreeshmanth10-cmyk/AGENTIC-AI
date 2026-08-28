"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Zap, Droplets, Trash2, Wind, Users, ArrowUpRight, 
  AlertTriangle, ShieldCheck, TrendingUp, Cpu, CheckCircle2, ChevronRight, Play
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('hackathon_demo_mode') === 'true') {
      sessionStorage.removeItem('hackathon_demo_mode');
      router.push('/agent?demo=true');
      return;
    }
    
    async function loadData() {
      try {
        const data = await api.getOverview();
        setOverview(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Loading Command Center Telemetry...</span>
        </div>
      </div>
    );
  }

  const kpis = overview?.kpis || {};
  const anomalies = overview?.anomalies || [];
  const facilities = overview?.facilities || [];
  const recs = overview?.recommendations || [];

  return (
    <div className="space-y-6">
      {/* Top Banner & Campus Score */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main Sustainability Index Scorecard */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-gradient-to-br from-[#121c38] to-[#0c1326] border border-cyan-500/30 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              <span>Campus Sustainability</span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">Grade B+</span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-black text-white">{kpis.sustainability_score || 74.8}</span>
              <span className="text-sm font-medium text-slate-400">/ 100</span>
            </div>
            <p className="mt-2 text-xs text-slate-300">
              Composite index across 8 campus facilities. Target 85.0 by Q4.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1e2a4a] flex items-center justify-between text-xs text-slate-400">
            <span>Active AI Agents:</span>
            <span className="font-bold text-emerald-400">12 / 12 Online</span>
          </div>
        </div>

        {/* 3 Core KPI Metric Tiles */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Water Loss & Leaks</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400"><Droplets className="w-4 h-4" /></div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-white">54,600 L</div>
            <div className="text-xs text-rose-400 flex items-center gap-1 mt-1 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" /> Building B Riser Leak Active
            </div>
          </div>
          <Link href="/water" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium">
            View Leak Analytics <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Energy Demand</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400"><Zap className="w-4 h-4" /></div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-white">485,200 kWh</div>
            <div className="text-xs text-amber-400 flex items-center gap-1 mt-1 font-medium">
              <span>+15.5% above baseline (HVAC)</span>
            </div>
          </div>
          <Link href="/energy" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium">
            Inspect Load Breakdown <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Cumulative Savings</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-white">₹{kpis.total_money_saved_inr?.toLocaleString() || '11,25,000'}</div>
            <div className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> {kpis.total_co2_avoided_tonnes || 116.8}t CO2 avoided
            </div>
          </div>
          <Link href="/impact" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium">
            Verified Impact Ledger <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Center Grid: Active Anomalies & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Anomalies Feed */}
        <div className="lg:col-span-2 rounded-2xl bg-[#0d1427] border border-[#1a233a] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">Live Discovered Anomalies</h2>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-semibold">
                {anomalies.length} Critical/High
              </span>
            </div>
            <Link href="/anomalies" className="text-xs text-cyan-400 hover:text-cyan-300">
              View All Anomaly Hub
            </Link>
          </div>

          <div className="space-y-3">
            {anomalies.map((anom: any) => (
              <div key={anom.id} className="p-3.5 rounded-xl bg-[#111a33] border border-[#1f2d4e] flex items-center justify-between hover:border-cyan-500/40 transition">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${anom.severity === 'CRITICAL' ? 'bg-rose-500 animate-ping' : 'bg-amber-400'}`} />
                  <div>
                    <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                      <span>{anom.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-normal">{anom.facility_id}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{anom.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <div className="text-xs font-bold text-rose-400">+{anom.deviation_pct}%</div>
                    <div className="text-[10px] text-slate-400">Loss: ₹{anom.estimated_monthly_loss?.toLocaleString()}/mo</div>
                  </div>
                  <Link
                    href={`/agent?query=Investigate%20${encodeURIComponent(anom.title)}&facility=${anom.facility_id}`}
                    className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30"
                  >
                    Investigate
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Top Recommendations & Fast Simulation */}
        <div className="rounded-2xl bg-[#0d1427] border border-[#1a233a] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white tracking-wide">Top AI Actions</h2>
              </div>
              <Link href="/recommendations" className="text-xs text-cyan-400 hover:text-cyan-300">
                All Actions
              </Link>
            </div>

            <div className="space-y-3">
              {recs.map((rec: any) => (
                <div key={rec.id} className="p-3 rounded-xl bg-[#111a33] border border-[#1f2d4e]">
                  <div className="text-xs font-bold text-slate-200">{rec.title}</div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Est. Savings: <strong className="text-emerald-400">₹{rec.estimated_cost_saving?.toLocaleString()}/mo</strong></span>
                    <span>Payback: <strong className="text-cyan-400">{rec.payback_period_months} mo</strong></span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      href="/approvals"
                      className="flex-1 py-1 text-center rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold"
                    >
                      Review Approval
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-blue-900/30 to-cyan-900/20 border border-cyan-500/30 text-xs">
            <div className="font-semibold text-cyan-300">Need instant forecasting?</div>
            <p className="text-[11px] text-slate-400 mt-1">Simulate HVAC and leak remediation in What-If Lab.</p>
            <Link href="/simulation" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-white underline">
              Open What-If Simulator →
            </Link>
          </div>
        </div>
      </div>

      {/* Facility Leaderboard & Digital Twin Preview */}
      <div className="rounded-2xl bg-[#0d1427] border border-[#1a233a] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">Campus Facility Ranking</h2>
            <p className="text-xs text-slate-400">Real-time normalized performance across 8 campus facilities</p>
          </div>
          <Link href="/digital-twin" className="px-3 py-1.5 rounded-lg bg-[#141d36] hover:bg-[#1b2647] border border-[#233157] text-xs font-medium text-slate-200">
            Open Interactive 3D Digital Twin
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {facilities.map((f: any) => (
            <Link
              key={f.id}
              href={`/facilities`}
              className={`p-3 rounded-xl border flex flex-col justify-between transition hover:scale-102 ${
                f.sustainability_score >= 78.0
                  ? 'bg-[#0f1d2e] border-emerald-500/30'
                  : f.sustainability_score >= 65.0
                  ? 'bg-[#1b1c1e] border-amber-500/30'
                  : 'bg-[#221016] border-rose-500/40'
              }`}
            >
              <div>
                <div className="text-[10px] text-slate-400 font-semibold">Rank #{f.rank}</div>
                <div className="text-xs font-bold text-white mt-1 truncate">{f.name.split(' ')[0]} {f.name.split(' ')[1]}</div>
              </div>
              <div className="mt-3">
                <div className="text-lg font-black text-white">{f.sustainability_score}</div>
                <div className={`text-[10px] font-semibold ${
                  f.sustainability_score >= 78.0 ? 'text-emerald-400' : (f.sustainability_score >= 65.0 ? 'text-amber-400' : 'text-rose-400')
                }`}>
                  {f.sustainability_score >= 78.0 ? 'Optimal' : (f.sustainability_score >= 65.0 ? 'Attention' : 'Critical')}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
