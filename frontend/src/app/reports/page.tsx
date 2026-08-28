"use client";
import React, { useState } from "react";
import {
  FileText, Sparkles, Printer, Droplets, Zap, Trash2,
  Wind, Leaf, AlertTriangle, CheckCircle2, TrendingUp,
  Award, RefreshCw, Building2, ChevronRight
} from "lucide-react";
import { api } from "@/lib/api";

// ── Helpers ────────────────────────────────────────────────────────────────────

function ProgressBar({ value, max = 100, color = "cyan" }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const colorMap: Record<string, string> = {
    cyan: "bg-cyan-400",
    emerald: "bg-emerald-400",
    amber: "bg-amber-400",
    rose: "bg-rose-400",
    violet: "bg-violet-400",
    blue: "bg-blue-400",
  };
  return (
    <div className="w-full h-1.5 rounded-full bg-slate-800">
      <div
        className={`h-1.5 rounded-full ${colorMap[color] ?? "bg-cyan-400"} transition-all duration-1000`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function KpiCard({
  label, value, unit, sub, color = "cyan", icon
}: { label: string; value: string | number; unit?: string; sub?: string; color?: string; icon: React.ReactNode }) {
  const borderMap: Record<string, string> = {
    cyan: "border-cyan-500/30", emerald: "border-emerald-500/30",
    amber: "border-amber-500/30", rose: "border-rose-500/30",
    violet: "border-violet-500/30", blue: "border-blue-500/30",
  };
  const textMap: Record<string, string> = {
    cyan: "text-cyan-400", emerald: "text-emerald-400",
    amber: "text-amber-400", rose: "text-rose-400",
    violet: "text-violet-400", blue: "text-blue-400",
  };
  const bgMap: Record<string, string> = {
    cyan: "bg-cyan-500/10", emerald: "bg-emerald-500/10",
    amber: "bg-amber-500/10", rose: "bg-rose-500/10",
    violet: "bg-violet-500/10", blue: "bg-blue-500/10",
  };
  return (
    <div className={`p-4 rounded-2xl bg-[#0d1427]/80 border ${borderMap[color]} backdrop-blur-md relative overflow-hidden`}>
      <div className={`inline-flex p-2 rounded-lg ${bgMap[color]} mb-2`}>{icon}</div>
      <div className={`text-2xl font-black font-mono ${textMap[color]}`}>
        {value}<span className="text-sm font-semibold ml-1 text-slate-400">{unit}</span>
      </div>
      <div className="text-[11px] font-semibold text-slate-300 mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700">{icon}</div>
      <div>
        <h3 className="text-sm font-bold text-white">{title}</h3>
        {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

const PRIORITY_STYLES: Record<string, string> = {
  Critical: "bg-rose-500/20 text-rose-300 border-rose-500/40",
  High: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  Medium: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  Low: "bg-slate-500/20 text-slate-300 border-slate-500/40",
};

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await api.generateReport();
      setReport(res);
    } catch (e: any) {
      setError(e?.message || "Failed to generate report. Is the backend running?");
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">

      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a233a] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">AI Sustainability Reports</h1>
              <p className="text-xs text-slate-400">Autonomous executive reporting and carbon accounting summaries</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {report && (
            <button
              onClick={() => window.print()}
              className="px-3 py-2.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition"
            >
              <Printer className="w-4 h-4" /> Print / PDF
            </button>
          )}
          <button
            id="generate-report-btn"
            onClick={handleGenerate}
            disabled={generating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition disabled:opacity-60"
          >
            {generating
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating AI Report...</>
              : <><Sparkles className="w-4 h-4" /> Generate AI Sustainability Report</>
            }
          </button>
        </div>
      </div>

      {/* ── ERROR STATE ── */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <p className="text-sm font-bold text-rose-300">Report generation failed</p>
            <p className="text-xs text-slate-400 mt-0.5">{error}</p>
          </div>
          <button onClick={handleGenerate} className="ml-auto px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold border border-rose-500/30 transition">
            Retry
          </button>
        </div>
      )}

      {/* ── LOADING STATE ── */}
      {generating && (
        <div className="p-12 rounded-2xl bg-[#0d1427] border border-cyan-500/20 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <p className="text-base font-bold text-white">Generating AI Sustainability Report...</p>
            <p className="text-xs text-slate-400 mt-1">EcoCore is synthesizing 30 days of water, energy, waste & air data</p>
          </div>
          <div className="max-w-xs mx-auto h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]" style={{ width: "60%" }} />
          </div>
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!report && !generating && !error && (
        <div className="p-16 rounded-2xl bg-[#0d1427] border border-[#1a233a] text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Report Generated Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Click <strong className="text-cyan-300">Generate AI Sustainability Report</strong> to have EcoCore synthesize
              30 days of energy, water, waste, and facility data into a full executive report.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition"
          >
            <Sparkles className="w-4 h-4" /> Generate AI Sustainability Report
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* REPORT BODY                                                           */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {report && !generating && (() => {
        const w = report.water ?? {};
        const e = report.energy ?? {};
        const wst = report.waste ?? {};
        const air = report.air ?? {};
        const imp = report.impact ?? {};
        const recs: any[] = report.recommendations ?? [];
        const rankings: any[] = report.facility_rankings ?? [];

        return (
          <div className="space-y-6">

            {/* ── REPORT HEADER CARD ── */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0a1128] to-[#0d1a3a] border border-cyan-500/25 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                        ✓ {report.status ?? "Executive Approved"}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{report.report_id}</span>
                    </div>
                    <h2 className="text-lg font-black text-white">{report.title}</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Reporting Period: <span className="text-slate-200">{report.period_start} — {report.period_end}</span>
                      &nbsp;·&nbsp; Generated by <span className="text-cyan-300">{report.generated_by ?? "EcoCore"}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                      {new Date(report.created_at).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}
                    </p>
                  </div>
                  {/* Overall Score Ring */}
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500/30 to-emerald-500/30 border-2 border-cyan-500/50 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                      <span className="text-2xl font-black text-white">{imp.sustainability_score ?? report.campus_sustainability_score}</span>
                      <span className="text-[9px] text-cyan-300 font-bold">/100</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Sustainability<br />Score</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── EXECUTIVE SUMMARY KPIs ── */}
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-3">Report Summary</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <KpiCard label="Water Consumed" value={(w.total_consumption_liters ?? 0).toLocaleString()} unit="L"
                  sub={`Saved: ${(w.water_saved_liters ?? 0).toLocaleString()} L`} color="cyan"
                  icon={<Droplets className="w-4 h-4 text-cyan-400" />} />
                <KpiCard label="Water Efficiency" value={w.efficiency_pct ?? 0} unit="%"
                  sub={`${w.leak_incidents ?? 0} leak incidents`} color="blue"
                  icon={<TrendingUp className="w-4 h-4 text-blue-400" />} />
                <KpiCard label="Energy Used" value={(e.total_kwh ?? 0).toLocaleString()} unit="kWh"
                  sub={`Saved: ${(e.energy_saved_kwh ?? 0).toLocaleString()} kWh`} color="amber"
                  icon={<Zap className="w-4 h-4 text-amber-400" />} />
                <KpiCard label="Waste Diverted" value={wst.diversion_pct ?? 0} unit="%"
                  sub={`${(wst.recycled_kg ?? 0).toLocaleString()} kg recycled`} color="emerald"
                  icon={<Trash2 className="w-4 h-4 text-emerald-400" />} />
                <KpiCard label="CO₂ Reduced" value={imp.co2_reduction_tonnes ?? report.co2_reduction_tonnes} unit="t"
                  sub={`Score: ${imp.sustainability_score ?? report.campus_sustainability_score}/100`} color="violet"
                  icon={<Leaf className="w-4 h-4 text-violet-400" />} />
              </div>
            </div>

            {/* ── WATER + ENERGY INTELLIGENCE ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Water */}
              <div className="p-5 rounded-2xl bg-[#0d1427]/80 border border-cyan-500/20 backdrop-blur-md">
                <SectionHeader
                  icon={<Droplets className="w-4 h-4 text-cyan-400" />}
                  title="Water Intelligence"
                  subtitle="30-day campus water telemetry" />
                <div className="space-y-3 text-xs">
                  {[
                    { label: "Total Consumption", value: `${(w.total_consumption_liters ?? 0).toLocaleString()} L`, pct: 72, color: "cyan" },
                    { label: "Daily Average", value: `${(w.daily_average_liters ?? 0).toLocaleString()} L/day`, pct: 60, color: "blue" },
                    { label: "Peak Day Usage", value: `${(w.peak_day_liters ?? 0).toLocaleString()} L`, pct: 80, color: "amber" },
                    { label: "Water Saved", value: `${(w.water_saved_liters ?? 0).toLocaleString()} L`, pct: w.efficiency_pct ?? 0, color: "emerald" },
                    { label: "Estimated Water Loss", value: `${(w.estimated_water_loss_liters ?? 0).toLocaleString()} L`, pct: 15, color: "rose" },
                  ].map(row => (
                    <div key={row.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400">{row.label}</span>
                        <span className="text-white font-mono font-bold">{row.value}</span>
                      </div>
                      <ProgressBar value={row.pct} color={row.color} />
                    </div>
                  ))}
                  <div className="mt-3 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Water Efficiency Score</span>
                      <span className="text-cyan-300 font-bold">{w.efficiency_pct ?? 0}%</span>
                    </div>
                    <div className="flex justify-between text-[11px] mt-1">
                      <span className="text-slate-400">Leak Incidents (30 days)</span>
                      <span className="text-rose-300 font-bold">{w.leak_incidents ?? 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Energy */}
              <div className="p-5 rounded-2xl bg-[#0d1427]/80 border border-amber-500/20 backdrop-blur-md">
                <SectionHeader
                  icon={<Zap className="w-4 h-4 text-amber-400" />}
                  title="Energy Intelligence"
                  subtitle="30-day campus energy metrics" />
                <div className="space-y-3 text-xs">
                  {[
                    { label: "Total Energy Consumed", value: `${(e.total_kwh ?? 0).toLocaleString()} kWh`, pct: 78, color: "amber" },
                    { label: "Peak Demand", value: `${e.peak_demand_kw ?? 0} kW`, pct: 65, color: "rose" },
                    { label: "Energy Saved", value: `${(e.energy_saved_kwh ?? 0).toLocaleString()} kWh`, pct: e.efficiency_pct ?? 0, color: "emerald" },
                    { label: "Efficiency Rate", value: `${e.efficiency_pct ?? 0}%`, pct: e.efficiency_pct ?? 0, color: "cyan" },
                    { label: "Renewable Mix", value: `${e.renewable_pct ?? 0}%`, pct: e.renewable_pct ?? 0, color: "violet" },
                  ].map(row => (
                    <div key={row.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400">{row.label}</span>
                        <span className="text-white font-mono font-bold">{row.value}</span>
                      </div>
                      <ProgressBar value={row.pct} color={row.color} />
                    </div>
                  ))}
                  <div className="mt-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Monthly Savings</span>
                      <span className="text-emerald-300 font-bold">₹{(imp.total_monthly_saving_inr ?? report.total_monthly_saving_inr ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[11px] mt-1">
                      <span className="text-slate-400">Energy Efficiency</span>
                      <span className="text-amber-300 font-bold">{e.efficiency_pct ?? 0}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── WASTE & AIR ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Waste */}
              <div className="p-5 rounded-2xl bg-[#0d1427]/80 border border-emerald-500/20 backdrop-blur-md">
                <SectionHeader
                  icon={<Trash2 className="w-4 h-4 text-emerald-400" />}
                  title="Waste & Circularity"
                  subtitle="Campus waste management performance" />
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Total Waste Generated</span>
                      <span className="text-white font-mono font-bold">{(wst.total_generated_kg ?? 0).toLocaleString()} kg</span>
                    </div>
                    <ProgressBar value={100} color="amber" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Recycled / Diverted</span>
                      <span className="text-emerald-300 font-mono font-bold">{(wst.recycled_kg ?? 0).toLocaleString()} kg</span>
                    </div>
                    <ProgressBar value={wst.diversion_pct ?? 0} color="emerald" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Sent to Landfill</span>
                      <span className="text-rose-300 font-mono font-bold">{(wst.landfill_kg ?? 0).toLocaleString()} kg</span>
                    </div>
                    <ProgressBar value={100 - (wst.diversion_pct ?? 0)} color="rose" />
                  </div>
                  <div className="mt-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex justify-between items-center">
                    <span className="text-slate-400 text-[11px]">Diversion Rate</span>
                    <span className="text-2xl font-black text-emerald-400">{wst.diversion_pct ?? 0}<span className="text-sm font-semibold text-slate-400 ml-0.5">%</span></span>
                  </div>
                </div>
              </div>

              {/* Environmental Impact */}
              <div className="p-5 rounded-2xl bg-[#0d1427]/80 border border-violet-500/20 backdrop-blur-md">
                <SectionHeader
                  icon={<Leaf className="w-4 h-4 text-violet-400" />}
                  title="Environmental Impact"
                  subtitle="Carbon & sustainability outcomes" />
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-center">
                      <div className="text-2xl font-black text-violet-400">{imp.co2_reduction_tonnes ?? report.co2_reduction_tonnes}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Tonnes CO₂ Reduced</div>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <div className="text-2xl font-black text-emerald-400">{imp.sustainability_score ?? report.campus_sustainability_score}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Sustainability Score</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Average Air Quality Index</span>
                      <span className="text-emerald-300 font-mono font-bold">{air.average_aqi ?? 0} AQI</span>
                    </div>
                    <ProgressBar value={air.average_aqi ?? 0} color="emerald" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Average CO₂ Concentration</span>
                      <span className="text-amber-300 font-mono font-bold">{air.average_co2_ppm ?? 0} ppm</span>
                    </div>
                    <ProgressBar value={Math.min(100, ((air.average_co2_ppm ?? 0) / 1000) * 100)} color="amber" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Resource Efficiency Score</span>
                      <span className="text-cyan-300 font-mono font-bold">{imp.resource_efficiency_score ?? 0}%</span>
                    </div>
                    <ProgressBar value={imp.resource_efficiency_score ?? 0} color="cyan" />
                  </div>
                  <div className="mt-2 p-3 rounded-xl bg-violet-500/5 border border-violet-500/20 flex justify-between text-[11px]">
                    <span className="text-slate-400">Buildings Exceeding CO₂ Threshold</span>
                    <span className="text-rose-300 font-bold">{air.buildings_exceeding_threshold ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── AI RECOMMENDATIONS ── */}
            {recs.length > 0 && (
              <div className="p-5 rounded-2xl bg-[#0a1128]/90 border border-cyan-500/20 backdrop-blur-md">
                <SectionHeader
                  icon={<Sparkles className="w-4 h-4 text-cyan-400" />}
                  title="AI Recommendations"
                  subtitle={`${recs.length} action items generated by EcoCore`} />
                <div className="space-y-3">
                  {recs.map((rec: any) => (
                    <div key={rec.id} className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-cyan-500/30 transition group">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold font-mono ${PRIORITY_STYLES[rec.priority] ?? PRIORITY_STYLES.Low}`}>
                            {rec.priority}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono text-slate-500">{rec.id}</span>
                            <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition">{rec.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{rec.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-bold text-emerald-400">{rec.saving}</div>
                          <div className="text-[10px] text-slate-500">Payback: {rec.payback}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── FACILITY RANKINGS ── */}
            {rankings.length > 0 && (
              <div className="p-5 rounded-2xl bg-[#0d1427]/80 border border-slate-800 backdrop-blur-md">
                <SectionHeader
                  icon={<Award className="w-4 h-4 text-amber-400" />}
                  title="Campus Facility Rankings"
                  subtitle="Sustainability score by building" />
                <div className="space-y-2">
                  {rankings.map((fac: any, idx: number) => (
                    <div key={fac.name} className="flex items-center gap-3">
                      <span className="w-5 text-[11px] font-mono text-slate-500 text-right shrink-0">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300 font-medium truncate">{fac.name}</span>
                          <span className="font-mono font-bold text-white shrink-0 ml-2">{fac.score}</span>
                        </div>
                        <ProgressBar
                          value={fac.score}
                          color={fac.score >= 80 ? "emerald" : fac.score >= 65 ? "amber" : "rose"}
                        />
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                        fac.status === "Top Performer" ? "bg-emerald-500/20 text-emerald-300" :
                        fac.status === "Good" ? "bg-cyan-500/20 text-cyan-300" :
                        fac.status === "Moderate" ? "bg-amber-500/20 text-amber-300" :
                        fac.status === "Critical" ? "bg-rose-500/20 text-rose-300 animate-pulse" :
                        "bg-slate-500/20 text-slate-300"
                      }`}>{fac.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── FOOTER ── */}
            <div className="p-4 rounded-xl bg-[#070c18] border border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span>Report ID: <span className="font-mono text-slate-400">{report.report_id}</span></span>
              <span>Generated: {new Date(report.created_at).toLocaleString("en-IN")}</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">EcoCore Verified</span>
              </span>
            </div>

          </div>
        );
      })()}
    </div>
  );
}
