'use client';
import React, { useState } from 'react';
import { BookOpen, RefreshCw, AlertTriangle, Download, FileText } from 'lucide-react';
import { api } from '@/lib/api';

const PERIODS = ['Daily','Weekly','Monthly','Quarterly'];

export default function ReportPage() {
  const [period, setPeriod] = useState('Monthly');
  const [fid, setFid] = useState('ALL');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const generate = async () => {
    try { setLoading(true); setError(null); const d = await api.generateWaterReport({facility_id:fid, period}); setData(d); }
    catch(e:any) { setError(e.message); } finally { setLoading(false); }
  };

  const download = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`${data.report_id}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const s = data?.sections;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="border-b border-[#1a233a] pb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2"><BookOpen className="text-indigo-400"/>AI Water Intelligence Report</h1>
        <p className="text-sm text-slate-400 mt-1">Generate structured reports with executive summary, anomalies, leaks, forecasts, savings opportunities, and sustainability scores</p>
        <span className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">⚠ Simulated Data</span>
      </div>

      {/* Controls */}
      <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a] flex flex-wrap items-center gap-4">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Report Period</label>
          <select value={period} onChange={e=>setPeriod(e.target.value)} className="px-3 py-2 rounded-lg bg-[#111a33] border border-[#1a233a] text-sm text-slate-200 focus:outline-none focus:border-cyan-400">
            {PERIODS.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Facility Scope</label>
          <select value={fid} onChange={e=>setFid(e.target.value)} className="px-3 py-2 rounded-lg bg-[#111a33] border border-[#1a233a] text-sm text-slate-200 focus:outline-none focus:border-cyan-400">
            <option value="ALL">All Facilities</option>
            <option value="BUILDING-A">Admin Block</option><option value="BUILDING-B">Science Block</option>
            <option value="BUILDING-C">Engineering Lab</option><option value="BUILDING-D">Arts & Media</option>
            <option value="BUILDING-E">Lecture Hall Complex</option>
          </select>
        </div>
        <button onClick={generate} disabled={loading} className="mt-5 px-6 py-2 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2">
          {loading?<RefreshCw className="w-4 h-4 animate-spin"/>:<FileText className="w-4 h-4"/>}Generate Report
        </button>
        {data&&<button onClick={download} className="mt-5 px-4 py-2 rounded-lg border border-[#1a233a] text-xs text-slate-300 hover:border-cyan-500/30 flex items-center gap-1"><Download className="w-3 h-3"/>Download JSON</button>}
        {error&&<div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs w-full">{error}</div>}
      </div>

      {data && !loading && (
        <div className="space-y-6">
          {/* Header */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-500/10 to-[#0d1427] border border-indigo-500/20">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs text-indigo-400 uppercase font-semibold mb-1">{data.report_id}</div>
                <div className="text-xl font-black text-white">{data.title}</div>
                <div className="text-xs text-slate-400 mt-1">Generated: {new Date(data.generated_at).toLocaleString()} · Scope: {data.facility_scope}</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">⚠ Simulated</span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a]">
            <h2 className="text-sm font-bold text-white mb-3">Executive Summary</h2>
            <p className="text-sm text-slate-300 leading-relaxed">{data.executive_summary}</p>
          </div>

          {/* Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Consumption */}
            <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a]">
              <h2 className="text-sm font-bold text-white mb-3">Water Consumption</h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Total Campus</span><span className="text-white font-semibold">{(s?.water_consumption?.total_campus_liters_per_day/1000||0).toFixed(0)} kL/day</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Benchmark</span><span className="text-white font-semibold">{(s?.water_consumption?.benchmark_liters_per_day/1000||0).toFixed(0)} kL/day</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Variance</span><span className="text-rose-400 font-bold">{s?.water_consumption?.variance_pct}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Top Consumer</span><span className="text-rose-300 font-semibold">{s?.water_consumption?.top_consumer}</span></div>
              </div>
              <div className="mt-3 space-y-1">
                {s?.water_consumption?.key_points?.map((p:string,i:number)=><div key={i} className="text-[11px] text-slate-400 flex gap-1.5"><span className="text-cyan-500">•</span>{p}</div>)}
              </div>
            </div>

            {/* Anomalies */}
            <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a]">
              <h2 className="text-sm font-bold text-white mb-3">Anomaly Summary</h2>
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                {[{l:'Total',v:s?.anomalies?.total_anomalies,c:'slate'},{l:'Critical',v:s?.anomalies?.critical,c:'rose'},{l:'High',v:s?.anomalies?.high,c:'orange'},{l:'Medium',v:s?.anomalies?.medium,c:'amber'}].map(i=>(
                  <div key={i.l} className={`p-2 rounded bg-${i.c}-500/10 border border-${i.c}-500/20 text-center`}>
                    <div className={`text-xl font-black text-${i.c}-300`}>{i.v}</div>
                    <div className={`text-[10px] text-${i.c}-400`}>{i.l}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-rose-200 p-2 rounded bg-rose-500/5 border border-rose-500/10">{s?.anomalies?.top_anomaly}</div>
            </div>

            {/* Leaks */}
            <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a]">
              <h2 className="text-sm font-bold text-white mb-3">Leak Detection Report</h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Active Leaks</span><span className="text-rose-400 font-bold">{s?.leaks?.active_leaks}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Suspected Leaks</span><span className="text-amber-400 font-bold">{s?.leaks?.suspected_leaks}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Monthly Loss</span><span className="text-white font-semibold">{(s?.leaks?.monthly_loss_liters/1000||0).toFixed(0)} kL</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Financial Loss</span><span className="text-rose-300 font-bold">₹{s?.leaks?.monthly_loss_inr?.toLocaleString()}/mo</span></div>
              </div>
            </div>

            {/* Savings Opportunities */}
            <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a]">
              <h2 className="text-sm font-bold text-white mb-3">Savings Opportunities</h2>
              <div className="space-y-2">
                {s?.savings_opportunities?.items?.map((i:any,idx:number)=>(
                  <div key={idx} className="flex justify-between items-center text-xs p-2 rounded bg-emerald-500/5 border border-emerald-500/10">
                    <span className="text-slate-300">{i.action}</span>
                    <span className="text-emerald-400 font-bold ml-2">₹{i.monthly_saving_inr?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs font-bold text-emerald-300 text-right">Total: ₹{s?.savings_opportunities?.total_potential_monthly_inr?.toLocaleString()}/mo</div>
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a]">
            <h2 className="text-sm font-bold text-white mb-3">Recommended Actions</h2>
            <div className="space-y-2">
              {s?.recommended_actions?.map((a:string,i:number)=>(
                <div key={i} className="flex items-start gap-2 text-xs p-2.5 rounded bg-[#111a33]">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">{i+1}</span>
                  <span className="text-slate-200">{a}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scores */}
          <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a]">
            <h2 className="text-sm font-bold text-white mb-3">Sustainability Scores</h2>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(s?.sustainability_scores||{}).map(([k,v]:any)=>(
                <div key={k} className="p-3 rounded-lg bg-[#111a33] text-center">
                  <div className={`text-2xl font-black ${v>=80?'text-emerald-400':v>=60?'text-amber-400':'text-rose-400'}`}>{v}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{k.replace('BUILDING-','Bldg ')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
