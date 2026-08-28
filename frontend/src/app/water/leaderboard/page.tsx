'use client';
import React, { useEffect, useState } from 'react';
import { Trophy, RefreshCw, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

export default function LeaderboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const load = async () => { try { setLoading(true); setError(null); const d = await api.getWaterLeaderboard(); setData(d); } catch(e:any) { setError(e.message); } finally { setLoading(false); }};
  useEffect(()=>{ load(); },[]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><RefreshCw className="w-10 h-10 text-cyan-400 animate-spin"/></div>;
  if (error) return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center"><AlertTriangle className="w-12 h-12 text-rose-400"/><p className="text-slate-400 text-sm">{error}</p><button onClick={load} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm">Retry</button></div>;

  const rows: any[] = data?.leaderboard || [];
  const chartData = rows.map(r=>({name:r.facility_name.split(' ')[0],score:r.sustainability_score,efficiency:r.water_efficiency_score}));

  const rankColors = ['#f59e0b','#94a3b8','#b45309','#64748b','#475569'];
  const leakColors: Record<string,string> = {CRITICAL:'rose',NONE:'emerald',LOW:'blue',MODERATE:'amber'};

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="border-b border-[#1a233a] pb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2"><Trophy className="text-amber-400"/>Facility Leaderboard</h1>
        <p className="text-sm text-slate-400 mt-1">Rank facilities by water efficiency, savings, anomaly count, leakage performance, and sustainability score</p>
        <span className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">⚠ Simulated Data</span>
      </div>

      {/* Best/Worst highlight */}
      {rows.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="text-xs text-emerald-400 font-semibold uppercase mb-1">🥇 Best Performer</div>
            <div className="text-lg font-black text-white">{rows[0]?.facility_name}</div>
            <div className="text-sm text-emerald-300 mt-1">Score: {rows[0]?.sustainability_score}/100 · Efficiency: {rows[0]?.water_efficiency_score}/100</div>
            <div className="text-xs text-emerald-400 mt-0.5">Savings: ₹{rows[0]?.monthly_savings_inr?.toLocaleString()}/month</div>
          </div>
          <div className="p-5 rounded-xl bg-rose-500/10 border border-rose-500/30">
            <div className="text-xs text-rose-400 font-semibold uppercase mb-1">⚠ Needs Attention</div>
            <div className="text-lg font-black text-white">{rows[rows.length-1]?.facility_name}</div>
            <div className="text-sm text-rose-300 mt-1">Score: {rows[rows.length-1]?.sustainability_score}/100 · {rows[rows.length-1]?.anomaly_count} anomalies</div>
            <div className="text-xs text-rose-400 mt-0.5">Leakage: {rows[rows.length-1]?.leakage_status}</div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a]">
        <h2 className="text-sm font-bold text-white mb-4">Score Comparison</h2>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a233a" vertical={false}/>
              <XAxis dataKey="name" stroke="#64748b" tick={{fill:'#64748b',fontSize:11}}/>
              <YAxis domain={[0,100]} stroke="#64748b" tick={{fill:'#64748b',fontSize:11}}/>
              <Tooltip contentStyle={{backgroundColor:'#111a33',borderColor:'#1a233a',borderRadius:'8px'}}/>
              <Bar dataKey="score" name="Sustainability Score" fill="#22d3ee" radius={[4,4,0,0]}>
                {chartData.map((e,i)=><Cell key={i} fill={rows[i]?.rank===1?'#f59e0b':rows[i]?.rank===rows.length?'#f43f5e':'#22d3ee'}/>)}
              </Bar>
              <Bar dataKey="efficiency" name="Efficiency Score" fill="#10b981" radius={[4,4,0,0]} opacity={0.6}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-[#0d1427] border border-[#1a233a] overflow-hidden">
        <div className="grid grid-cols-7 p-3 border-b border-[#1a233a] text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          <span>Rank</span><span className="col-span-2">Facility</span><span>Score</span><span>Efficiency</span><span>Savings</span><span>Leakage</span>
        </div>
        {rows.map((r:any)=>{
          const lc = leakColors[r.leakage_status]||'slate';
          return (
            <div key={r.facility_id} className={`grid grid-cols-7 p-3 border-b border-[#1a233a] text-xs hover:bg-[#111a33] transition-colors ${r.rank===1?'bg-amber-500/5':r.rank===rows.length?'bg-rose-500/5':''}`}>
              <span className="flex items-center gap-1">
                <span style={{color:rankColors[r.rank-1]||'#64748b'}} className="text-lg font-black">{r.rank}</span>
                {r.badge&&<span className="text-[8px] text-slate-500">{r.badge}</span>}
              </span>
              <span className="col-span-2">
                <div className="font-semibold text-white">{r.facility_name}</div>
                <div className="text-[10px] text-slate-500">{r.facility_id} · {r.anomaly_count} anomalies</div>
              </span>
              <span className="font-black text-white text-sm">{r.sustainability_score}</span>
              <span className="font-bold text-cyan-300">{r.water_efficiency_score}</span>
              <span className="text-emerald-300 font-semibold">₹{r.monthly_savings_inr?.toLocaleString()}</span>
              <span className={`text-${lc}-400 font-semibold text-[10px]`}>{r.leakage_status}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
