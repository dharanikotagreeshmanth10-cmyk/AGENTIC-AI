'use client';
import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export default function EfficiencyPage() {
  const [data, setData] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  const load = async () => {
    try { setLoading(true); setError(null); const d = await api.getWaterEfficiencyScores(); setData(d); if(d.facilities?.length) setSelected(d.facilities[0]); }
    catch(e:any) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><RefreshCw className="w-10 h-10 text-cyan-400 animate-spin"/></div>;
  if (error) return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center"><AlertTriangle className="w-12 h-12 text-rose-400"/><p className="text-slate-400 text-sm">{error}</p><button onClick={load} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm">Retry</button></div>;

  const colorMap: Record<string,string> = {emerald:'#10b981',blue:'#3b82f6',amber:'#f59e0b',rose:'#f43f5e'};
  const radarData = selected ? Object.entries(selected.breakdown||{}).map(([k,v]:any)=>({subject:k.replace(/_/g,' '),A:Math.max(0,v)})) : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="border-b border-[#1a233a] pb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2"><Activity className="text-cyan-400"/>Water Efficiency Score</h1>
        <p className="text-sm text-slate-400 mt-1">Composite 0–100 score per facility: consumption, occupancy, anomalies, leakage, forecast, reuse, conservation</p>
        <span className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">⚠ Simulated Data</span>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {data?.facilities?.map((f:any)=>(
          <button key={f.facility_id} onClick={()=>setSelected(f)} className={`p-4 rounded-xl border text-left transition-all ${selected?.facility_id===f.facility_id?'border-cyan-400 bg-[#152445] scale-105':'border-[#1a233a] bg-[#0d1427] hover:border-cyan-500/40'}`}>
            <div className="text-xs text-slate-400 mb-1 truncate">{f.facility_name}</div>
            <div className="text-3xl font-black" style={{color:colorMap[f.color]||'#fff'}}>{f.score}</div>
            <div className="text-[10px] mt-1" style={{color:colorMap[f.color]||'#fff'}}>{f.label}</div>
            <div className="mt-2 w-full bg-[#1a233a] rounded-full h-1.5">
              <div className="h-1.5 rounded-full transition-all" style={{width:`${f.score}%`,backgroundColor:colorMap[f.color]||'#10b981'}}/>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar chart */}
          <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a]">
            <h2 className="text-sm font-bold text-white mb-4">{selected.facility_name} — Score Breakdown</h2>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={radarData} layout="vertical" margin={{left:20,right:20}}>
                  <XAxis type="number" domain={[-25,100]} stroke="#64748b" tick={{fill:'#64748b',fontSize:10}}/>
                  <YAxis dataKey="subject" type="category" stroke="#64748b" tick={{fill:'#64748b',fontSize:10}} width={120}/>
                  <Tooltip contentStyle={{backgroundColor:'#111a33',borderColor:'#1a233a',borderRadius:'8px'}}/>
                  <Bar dataKey="A" radius={4}>
                    {radarData.map((e,i)=><Cell key={i} fill={e.A<0?'#f43f5e':'#22d3ee'}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Radar */}
          <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a] flex flex-col items-center">
            <h2 className="text-sm font-bold text-white mb-4">Radar Profile</h2>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData.filter(r=>r.A>=0)}>
                  <PolarGrid stroke="#1a233a"/>
                  <PolarAngleAxis dataKey="subject" tick={{fill:'#64748b',fontSize:9}}/>
                  <Radar name="Score" dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2}/>
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
