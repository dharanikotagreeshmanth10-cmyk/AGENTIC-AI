'use client';
import React, { useEffect, useState } from 'react';
import { Waves, RefreshCw, AlertTriangle, Building2, Droplets, GitBranch, Activity, Gauge, Radio } from 'lucide-react';
import { api } from '@/lib/api';

const FACILITIES = ['BUILDING-A','BUILDING-B','BUILDING-C','BUILDING-D','BUILDING-E'];
const FN: Record<string,string> = {'BUILDING-A':'Admin Block','BUILDING-B':'Science Block','BUILDING-C':'Engineering Lab','BUILDING-D':'Arts & Media','BUILDING-E':'Lecture Hall Complex'};

const StatusBadge = ({s}:{s:string}) => {
  const c = s==='CRITICAL'?'bg-rose-500/20 text-rose-400 border-rose-500/30':s==='WARNING'?'bg-amber-500/20 text-amber-400 border-amber-500/30':s==='RUNNING'?'bg-cyan-500/20 text-cyan-400 border-cyan-500/30':'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  return <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold uppercase ${c}`}>{s}</span>;
};

export default function WaterDigitalTwinPage() {
  const [fid, setFid] = useState('BUILDING-B');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  const load = async (f:string) => {
    try { setLoading(true); setError(null); const d = await api.getWaterDigitalTwin(f); setData(d); }
    catch(e:any) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(()=>{ load(fid); },[fid]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><RefreshCw className="w-10 h-10 text-cyan-400 animate-spin"/></div>;
  if (error) return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3"><AlertTriangle className="w-12 h-12 text-rose-400"/><p className="text-slate-400 text-sm max-w-md text-center">{error}</p><button onClick={()=>load(fid)} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm">Retry</button></div>;

  const inf = data?.infrastructure || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1a233a] pb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2"><Waves className="text-cyan-400"/>Water Digital Twin</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time water infrastructure visualization — buildings, tanks, pipelines, pumps, valves, meters</p>
          <span className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">⚠ Simulated Data</span>
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="text-slate-400 w-4 h-4"/>
          <select value={fid} onChange={e=>setFid(e.target.value)} className="px-3 py-2 rounded-lg bg-[#0d1427] border border-[#1a233a] text-sm text-slate-200 focus:outline-none focus:border-cyan-400">
            {FACILITIES.map(f=><option key={f} value={f}>{FN[f]}</option>)}
          </select>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {label:'Tank Level', value:`${data?.tank_level_pct}%`, icon:Droplets, color:'cyan'},
          {label:'Flow Rate', value:`${data?.flow_rate_lpm} L/min`, icon:Activity, color:'blue'},
          {label:'Pressure', value:`${data?.pressure_psi} PSI`, icon:Gauge, color:'indigo'},
          {label:'Leak Status', value:data?.leak_status, icon:AlertTriangle, color:data?.leak_status==='CRITICAL'?'rose':'emerald'},
        ].map(kpi=>(
          <div key={kpi.label} className="p-5 rounded-xl bg-gradient-to-br from-[#0d1427] to-[#111a33] border border-[#1a233a] shadow-lg">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <kpi.icon className={`w-4 h-4 text-${kpi.color}-400`}/>
              <span className="text-xs font-semibold uppercase tracking-wider">{kpi.label}</span>
            </div>
            <div className={`text-2xl font-black text-white`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipelines */}
        <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a]">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><GitBranch className="w-4 h-4 text-cyan-400"/>Pipelines</h2>
          <div className="space-y-2">
            {inf.pipelines?.map((pl:any)=>(
              <div key={pl.id} className="flex items-center justify-between p-3 rounded-lg bg-[#111a33] border border-[#1a233a] text-xs">
                <div>
                  <div className="font-semibold text-white">{pl.from} → {pl.to}</div>
                  <div className="text-slate-400">{pl.id} • ⌀{pl.diameter_mm}mm • {pl.flow_direction}</div>
                </div>
                <StatusBadge s={pl.status}/>
              </div>
            ))}
          </div>
        </div>

        {/* Tanks */}
        <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a]">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Droplets className="w-4 h-4 text-blue-400"/>Tanks</h2>
          <div className="space-y-4">
            {inf.tanks?.map((t:any)=>(
              <div key={t.id} className="p-3 rounded-lg bg-[#111a33] border border-[#1a233a]">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-xs font-semibold text-white">{t.name}</div>
                    <div className="text-[10px] text-slate-400">{t.id} • Cap: {(t.capacity_liters/1000).toFixed(0)}kL</div>
                  </div>
                  <StatusBadge s={t.status}/>
                </div>
                <div className="w-full bg-[#1a233a] rounded-full h-2">
                  <div className={`h-2 rounded-full ${t.current_level_pct<30?'bg-rose-400':t.current_level_pct<60?'bg-amber-400':'bg-cyan-400'}`} style={{width:`${t.current_level_pct}%`}}/>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">{t.current_level_pct}% full</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pumps */}
        <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a]">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-indigo-400"/>Pumps</h2>
          <div className="space-y-2">
            {inf.pumps?.map((p:any)=>(
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-[#111a33] border border-[#1a233a] text-xs">
                <div>
                  <div className="font-semibold text-white">{p.name}</div>
                  <div className="text-slate-400">{p.id} • {p.flow_lpm} L/min • {p.pressure_psi} PSI</div>
                </div>
                <StatusBadge s={p.status}/>
              </div>
            ))}
          </div>
        </div>

        {/* Meters + Valves */}
        <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a]">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Radio className="w-4 h-4 text-emerald-400"/>Meters & Valves</h2>
          <div className="space-y-2">
            {inf.meters?.map((m:any)=>(
              <div key={m.id} className="flex justify-between p-2 rounded bg-[#111a33] text-xs">
                <span className="text-slate-300">{m.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-300 font-mono">{m.reading_lpm} L/min</span>
                  <StatusBadge s={m.status}/>
                </div>
              </div>
            ))}
            <div className="mt-2 pt-2 border-t border-[#1a233a]">
              {inf.valves?.map((v:any)=>(
                <div key={v.id} className="flex justify-between p-2 rounded hover:bg-[#111a33] text-xs">
                  <span className="text-slate-300">{v.name} <span className="text-[10px] text-slate-500">({v.zone})</span></span>
                  <StatusBadge s={v.position}/>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
