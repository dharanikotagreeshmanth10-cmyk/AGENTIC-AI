'use client';
import React, { useEffect, useState } from 'react';
import { GitBranch, RefreshCw, AlertTriangle, Building2, CheckCircle2, Clock, Loader2, Circle } from 'lucide-react';
import { api } from '@/lib/api';

const FACILITIES = ['BUILDING-A','BUILDING-B','BUILDING-C','BUILDING-D','BUILDING-E'];
const FN: Record<string,string> = {'BUILDING-A':'Admin Block','BUILDING-B':'Science Block','BUILDING-C':'Engineering Lab','BUILDING-D':'Arts & Media','BUILDING-E':'Lecture Hall Complex'};

export default function TimelinePage() {
  const [fid, setFid] = useState('BUILDING-B');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  const load = async (f:string) => {
    try { setLoading(true); setError(null); const d = await api.getWaterActivityTimeline(f); setData(d); }
    catch(e:any) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(()=>{ load(fid); },[fid]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><RefreshCw className="w-10 h-10 text-cyan-400 animate-spin"/></div>;
  if (error) return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center"><AlertTriangle className="w-12 h-12 text-rose-400"/><p className="text-slate-400 text-sm">{error}</p><button onClick={()=>load(fid)} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm">Retry</button></div>;

  const steps: any[] = data?.timeline || [];
  const pct = Math.round((data?.completed_steps / data?.total_steps) * 100);

  const statusIcon = (s:string) => s==='COMPLETED'?<CheckCircle2 className="w-5 h-5 text-emerald-400"/>:s==='IN_PROGRESS'?<Loader2 className="w-5 h-5 text-cyan-400 animate-spin"/>:s==='PENDING'?<Clock className="w-5 h-5 text-slate-500"/>:<Circle className="w-5 h-5 text-slate-600"/>;
  const statusC = (s:string) => s==='COMPLETED'?'emerald':s==='IN_PROGRESS'?'cyan':'slate';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1a233a] pb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2"><GitBranch className="text-cyan-400"/>Agent Activity Timeline</h1>
          <p className="text-sm text-slate-400 mt-1">Full execution trace from User Request → EcoCore → Agents → Analysis → Recommendation → Approval → Impact</p>
          <span className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">⚠ Simulated Data</span>
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="text-slate-400 w-4 h-4"/>
          <select value={fid} onChange={e=>setFid(e.target.value)} className="px-3 py-2 rounded-lg bg-[#0d1427] border border-[#1a233a] text-sm text-slate-200 focus:outline-none focus:border-cyan-400">
            {FACILITIES.map(f=><option key={f} value={f}>{FN[f]}</option>)}
          </select>
        </div>
      </div>

      {/* Progress */}
      <div className="p-4 rounded-xl bg-[#0d1427] border border-[#1a233a]">
        <div className="flex justify-between mb-2 text-xs">
          <span className="text-slate-400">Workflow Progress</span>
          <span className="font-bold text-cyan-300">{data?.completed_steps}/{data?.total_steps} steps completed ({pct}%)</span>
        </div>
        <div className="w-full bg-[#1a233a] rounded-full h-2">
          <div className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all" style={{width:`${pct}%`}}/>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-[#1a233a]"/>
        <div className="space-y-4">
          {steps.map((s:any, i:number)=>{
            const c = statusC(s.status);
            return (
              <div key={s.step} className="relative pl-16">
                <div className={`absolute left-3.5 top-3 w-5 h-5 rounded-full bg-[#0d1427] border-2 border-${c}-500/50 flex items-center justify-center`}>
                  {statusIcon(s.status)}
                </div>
                <div className={`p-4 rounded-xl border transition-all ${s.status==='IN_PROGRESS'?'bg-cyan-500/5 border-cyan-500/30':s.status==='PENDING'?'bg-[#0d1427] border-[#1a233a] opacity-60':'bg-[#0d1427] border-[#1a233a]'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500">#{s.step}</span>
                      <span className="text-sm font-bold text-white">{s.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded bg-${c}-500/20 text-${c}-400`}>{s.status.replace('_',' ')}</span>
                    </div>
                    {s.duration_ms&&<span className="text-[10px] text-slate-500">{s.duration_ms}ms</span>}
                  </div>
                  <div className="text-xs text-slate-400">{s.description}</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    <span className="text-cyan-400 mr-2">{s.actor}</span>
                    {s.timestamp?new Date(s.timestamp).toLocaleTimeString():'Pending'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
