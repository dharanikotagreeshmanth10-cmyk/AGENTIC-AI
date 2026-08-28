'use client';
import React, { useEffect, useState } from 'react';
import { Target, RefreshCw, AlertTriangle, CheckCircle2, Clock, TrendingDown } from 'lucide-react';
import { api } from '@/lib/api';

const STATUS_STYLES: Record<string,string> = {ON_TRACK:'emerald',AT_RISK:'amber',BEHIND:'rose',NOT_STARTED:'slate',COMPLETED:'cyan'};
const STATUS_ICONS: Record<string,any> = {ON_TRACK:CheckCircle2,AT_RISK:AlertTriangle,BEHIND:TrendingDown,NOT_STARTED:Clock};

export default function GoalsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  const load = async () => {
    try { setLoading(true); setError(null); const d = await api.getWaterGoals(); setData(d); }
    catch(e:any) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><RefreshCw className="w-10 h-10 text-cyan-400 animate-spin"/></div>;
  if (error) return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center"><AlertTriangle className="w-12 h-12 text-rose-400"/><p className="text-slate-400 text-sm">{error}</p><button onClick={load} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm">Retry</button></div>;

  const goals: any[] = data?.goals || [];
  const onTrack = goals.filter(g=>g.status==='ON_TRACK').length;
  const atRisk = goals.filter(g=>g.status==='AT_RISK').length;
  const behind = goals.filter(g=>['BEHIND','NOT_STARTED'].includes(g.status)).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="border-b border-[#1a233a] pb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2"><Target className="text-cyan-400"/>Sustainability Goals</h1>
        <p className="text-sm text-slate-400 mt-1">Track water sustainability targets with progress, deadlines, and current performance status</p>
        <span className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">⚠ Simulated Data</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[{label:'On Track',v:onTrack,c:'emerald'},{label:'At Risk',v:atRisk,c:'amber'},{label:'Behind/Not Started',v:behind,c:'rose'}].map(k=>(
          <div key={k.label} className={`p-4 rounded-xl bg-${k.c}-500/10 border border-${k.c}-500/20 text-center`}>
            <div className={`text-3xl font-black text-${k.c}-300`}>{k.v}</div>
            <div className={`text-xs text-${k.c}-400 mt-1`}>{k.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {goals.map((g:any)=>{
          const c = STATUS_STYLES[g.status]||'slate';
          const Icon = STATUS_ICONS[g.status]||Clock;
          return (
            <div key={g.id} className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a] hover:border-cyan-500/20 transition-all">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-500/10 text-slate-400 capitalize">{g.category.replace(/_/g,' ')}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded bg-${c}-500/20 text-${c}-400 flex items-center gap-1`}><Icon className="w-2.5 h-2.5"/>{g.status.replace(/_/g,' ')}</span>
                  </div>
                  <div className="text-sm font-bold text-white">{g.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{g.description}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-black text-white">{g.progress_pct}%</div>
                  <div className="text-[10px] text-slate-400">of target</div>
                </div>
              </div>
              <div className="w-full bg-[#1a233a] rounded-full h-2 mb-2">
                <div className={`h-2 rounded-full bg-${c}-400 transition-all`} style={{width:`${Math.min(100,g.progress_pct)}%`}}/>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Current: <span className="text-white font-semibold">{g.current} {g.unit}</span></span>
                <span>Target: <span className="text-white font-semibold">{g.target} {g.unit}</span></span>
                <span>Deadline: <span className="text-slate-300">{g.deadline}</span></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
