'use client';
import React, { useEffect, useState } from 'react';
import { Radio, RefreshCw, AlertTriangle, CheckCircle2, AlertOctagon, XCircle } from 'lucide-react';
import { api } from '@/lib/api';

type Status = 'ONLINE'|'DEGRADED'|'OFFLINE';
const SC: Record<Status,string> = {ONLINE:'emerald',DEGRADED:'amber',OFFLINE:'rose'};
const ICONS: Record<Status,any> = {ONLINE:CheckCircle2,DEGRADED:AlertOctagon,OFFLINE:XCircle};

export default function SensorHealthPage() {
  const [data, setData] = useState<any>(null);
  const [filter, setFilter] = useState<'ALL'|Status>('ALL');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  const load = async () => {
    try { setLoading(true); setError(null); const d = await api.getWaterSensorHealth(); setData(d); }
    catch(e:any) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><RefreshCw className="w-10 h-10 text-cyan-400 animate-spin"/></div>;
  if (error) return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center"><AlertTriangle className="w-12 h-12 text-rose-400"/><p className="text-slate-400 text-sm">{error}</p><button onClick={load} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm">Retry</button></div>;

  const sensors = (data?.sensors||[]).filter((s:any)=>(filter==='ALL'||s.status===filter)&&(typeFilter==='all'||s.sensor_type===typeFilter));
  const types = Array.from(new Set<string>((data?.sensors||[]).map((s:any)=>s.sensor_type)));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="border-b border-[#1a233a] pb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2"><Radio className="text-cyan-400"/>Sensor Health Center</h1>
        <p className="text-sm text-slate-400 mt-1">Real-time monitoring of all water sensors — flow meters, pressure transducers, quality probes, leak detectors</p>
        <span className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">⚠ Simulated Data</span>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {label:'Total Sensors', value:data?.summary?.total, color:'slate'},
          {label:'Online', value:data?.summary?.online, color:'emerald'},
          {label:'Degraded', value:data?.summary?.degraded, color:'amber'},
          {label:'Offline', value:data?.summary?.offline, color:'rose'},
        ].map(c=>(
          <div key={c.label} className={`p-5 rounded-xl bg-gradient-to-br from-[#0d1427] to-[#111a33] border border-[#1a233a]`}>
            <div className={`text-xs text-${c.color}-400 uppercase font-semibold mb-2`}>{c.label}</div>
            <div className="text-3xl font-black text-white">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Fleet Health Bar */}
      <div className="p-4 rounded-xl bg-[#0d1427] border border-[#1a233a]">
        <div className="flex justify-between mb-2 text-xs">
          <span className="text-slate-400">Fleet Health</span>
          <span className={`font-bold ${(data?.summary?.health_pct||0)>90?'text-emerald-400':(data?.summary?.health_pct||0)>70?'text-amber-400':'text-rose-400'}`}>{data?.summary?.health_pct}%</span>
        </div>
        <div className="w-full bg-[#1a233a] rounded-full h-3">
          <div className={`h-3 rounded-full ${(data?.summary?.health_pct||0)>90?'bg-emerald-400':(data?.summary?.health_pct||0)>70?'bg-amber-400':'bg-rose-400'}`} style={{width:`${data?.summary?.health_pct}%`}}/>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {(['ALL','ONLINE','DEGRADED','OFFLINE'] as const).map(s=>(
          <button key={s} onClick={()=>setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter===s?'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30':'text-slate-400 border border-[#1a233a] hover:border-cyan-500/30'}`}>{s}</button>
        ))}
        <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} className="px-3 py-1.5 rounded-lg bg-[#0d1427] border border-[#1a233a] text-xs text-slate-200 focus:outline-none">
          <option value="all">All Types</option>
          {types.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
        <span className="text-xs text-slate-400 ml-auto">{sensors.length} sensors shown</span>
      </div>

      {/* Sensor Table */}
      <div className="rounded-xl bg-[#0d1427] border border-[#1a233a] overflow-hidden">
        <div className="grid grid-cols-6 p-3 border-b border-[#1a233a] text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          <span>Sensor ID</span><span>Name</span><span>Type</span><span>Status</span><span>Reading</span><span>Last Update</span>
        </div>
        <div className="divide-y divide-[#1a233a] max-h-[500px] overflow-y-auto">
          {sensors.map((s:any)=>{
            const Icon = ICONS[s.status as Status]||CheckCircle2;
            const c = SC[s.status as Status]||'slate';
            return (
              <div key={s.id} className="grid grid-cols-6 p-3 text-xs hover:bg-[#111a33] transition-colors">
                <span className="font-mono text-slate-400">{s.id}</span>
                <span className="text-slate-200 truncate">{s.name}</span>
                <span className="text-slate-400">{s.sensor_type}</span>
                <span><span className={`flex items-center gap-1 text-${c}-400`}><Icon className="w-3 h-3"/>{s.status}</span></span>
                <span className="font-mono text-cyan-300">{s.reading}</span>
                <span className="text-slate-500">{s.last_update?new Date(s.last_update).toLocaleTimeString():'-'}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
