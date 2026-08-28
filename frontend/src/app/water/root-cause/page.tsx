'use client';
import React, { useEffect, useState } from 'react';
import { GitBranch, RefreshCw, AlertTriangle, Building2, CheckCircle2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const FACILITIES = ['BUILDING-A','BUILDING-B','BUILDING-C','BUILDING-D','BUILDING-E'];
const FN: Record<string,string> = {'BUILDING-A':'Admin Block','BUILDING-B':'Science Block','BUILDING-C':'Engineering Lab','BUILDING-D':'Arts & Media','BUILDING-E':'Lecture Hall Complex'};
const TYPES = ['HIGH_FLOW','LOW_PRESSURE','HIGH_CONSUMPTION'];

export default function RootCausePage() {
  const [fid, setFid] = useState('BUILDING-B');
  const [atype, setAtype] = useState('HIGH_FLOW');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  const load = async (f:string, t:string) => {
    try { setLoading(true); setError(null); const d = await api.getWaterRootCause(f, t); setData(d); }
    catch(e:any) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(()=>{ load(fid, atype); },[fid, atype]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><RefreshCw className="w-10 h-10 text-cyan-400 animate-spin"/></div>;
  if (error) return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center"><AlertTriangle className="w-12 h-12 text-rose-400"/><p className="text-slate-400 text-sm">{error}</p><button onClick={()=>load(fid,atype)} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm">Retry</button></div>;

  const sevColor = (s:string) => s==='CRITICAL'?'rose':s==='HIGH'?'orange':s==='MEDIUM'?'amber':'blue';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1a233a] pb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2"><GitBranch className="text-purple-400"/>Root Cause Investigation</h1>
          <p className="text-sm text-slate-400 mt-1">AI-powered root cause analysis with possible causes, supporting evidence, and confidence scores</p>
          <span className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">⚠ Simulated Data</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Building2 className="text-slate-400 w-4 h-4"/>
          <select value={fid} onChange={e=>setFid(e.target.value)} className="px-3 py-2 rounded-lg bg-[#0d1427] border border-[#1a233a] text-sm text-slate-200 focus:outline-none focus:border-cyan-400">
            {FACILITIES.map(f=><option key={f} value={f}>{FN[f]}</option>)}
          </select>
          <select value={atype} onChange={e=>setAtype(e.target.value)} className="px-3 py-2 rounded-lg bg-[#0d1427] border border-[#1a233a] text-sm text-slate-200 focus:outline-none focus:border-cyan-400">
            {TYPES.map(t=><option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
          </select>
        </div>
      </div>

      {/* Header Card */}
      <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a] flex flex-col md:flex-row justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Anomaly</div>
          <div className="text-sm font-bold text-white">{data?.anomaly_description}</div>
          <div className="text-xs text-slate-400 mt-1">{data?.facility_name} · Est. Resolution: {data?.estimated_resolution_hours}h</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-400 mb-1">Confidence Score</div>
          <div className="text-4xl font-black text-cyan-400">{Math.round((data?.confidence_score||0)*100)}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Possible Causes */}
        <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a]">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Search className="w-4 h-4 text-purple-400"/>Possible Causes</h2>
          <div className="space-y-3">
            {data?.possible_causes?.map((c:any,i:number)=>(
              <div key={i} className="p-3 rounded-lg bg-[#111a33] border border-[#1a233a]">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-white">{c.cause}</span>
                  <span className="text-xs text-cyan-400 font-bold">{Math.round(c.probability*100)}%</span>
                </div>
                <div className="w-full bg-[#1a233a] rounded-full h-1.5 mb-1">
                  <div className="h-1.5 rounded-full bg-cyan-400" style={{width:`${c.probability*100}%`}}/>
                </div>
                <div className="text-[10px] text-slate-500">{c.evidence_count} supporting evidence point{c.evidence_count>1?'s':''}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Supporting Evidence */}
        <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a]">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-400"/>Supporting Evidence</h2>
          <div className="space-y-3">
            {data?.supporting_evidence?.map((e:any,i:number)=>(
              <div key={i} className={`p-3 rounded-lg border bg-${sevColor(e.severity)}-500/10 border-${sevColor(e.severity)}-500/20`}>
                <div className="flex justify-between text-xs mb-1">
                  <span className={`font-semibold text-${sevColor(e.severity)}-300`}>{e.metric}</span>
                  <span className={`text-${sevColor(e.severity)}-400 font-bold`}>{e.severity}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs bg-black/20 rounded p-2 mt-1">
                  <div><div className="text-[9px] text-slate-400 mb-0.5">Expected</div><div className="font-mono text-white">{e.expected}</div></div>
                  <div><div className="text-[9px] text-slate-400 mb-0.5">Actual</div><div className="font-mono font-bold text-white">{e.actual}</div></div>
                  <div><div className="text-[9px] text-slate-400 mb-0.5">Deviation</div><div className={`font-mono font-bold text-${sevColor(e.severity)}-300`}>{e.deviation_pct}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Investigation Steps */}
      <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a]">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/>Recommended Investigation Steps</h2>
        <div className="space-y-2">
          {data?.recommended_investigation?.map((step:string,i:number)=>(
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#111a33] text-xs">
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i+1}</div>
              <span className="text-slate-200">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
