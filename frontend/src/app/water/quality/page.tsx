'use client';
import React, { useEffect, useState } from 'react';
import { TestTube2, RefreshCw, AlertTriangle, Building2, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const FACILITIES = ['BUILDING-A','BUILDING-B','BUILDING-C','BUILDING-D','BUILDING-E'];
const FN: Record<string,string> = {'BUILDING-A':'Admin Block','BUILDING-B':'Science Block','BUILDING-C':'Engineering Lab','BUILDING-D':'Arts & Media','BUILDING-E':'Lecture Hall Complex'};

export default function WaterQualityPage() {
  const [fid, setFid] = useState('BUILDING-B');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  const load = async (f:string) => {
    try { setLoading(true); setError(null); const d = await api.getWaterQuality(f); setData(d); }
    catch(e:any) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(()=>{ load(fid); },[fid]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><RefreshCw className="w-10 h-10 text-cyan-400 animate-spin"/></div>;
  if (error) return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center"><AlertTriangle className="w-12 h-12 text-rose-400"/><p className="text-slate-400 text-sm">{error}</p><button onClick={()=>load(fid)} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm">Retry</button></div>;

  const sc = data?.overall_status==='CRITICAL'?'rose':data?.overall_status==='WARNING'?'amber':'emerald';
  const radarData = (data?.readings||[]).map((r:any)=>({subject:r.parameter, A:r.status==='NORMAL'?100:r.status==='WARNING'?60:20}));

  const statusColor = (s:string) => s==='CRITICAL'?'rose':s==='WARNING'?'amber':'emerald';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1a233a] pb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2"><TestTube2 className="text-cyan-400"/>Water Quality Monitor</h1>
          <p className="text-sm text-slate-400 mt-1">pH, turbidity, temperature, conductivity, TDS — with configurable NORMAL/WARNING/CRITICAL thresholds</p>
          <div className="flex gap-2 mt-2">
            <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">⚠ Simulated Data</span>
            <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-slate-500/10 text-slate-400 border border-slate-500/20">{data?.note}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="text-slate-400 w-4 h-4"/>
          <select value={fid} onChange={e=>setFid(e.target.value)} className="px-3 py-2 rounded-lg bg-[#0d1427] border border-[#1a233a] text-sm text-slate-200 focus:outline-none focus:border-cyan-400">
            {FACILITIES.map(f=><option key={f} value={f}>{FN[f]}</option>)}
          </select>
        </div>
      </div>

      {/* Overall Status */}
      <div className={`p-5 rounded-xl bg-${sc}-500/10 border border-${sc}-500/30 flex items-center justify-between`}>
        <div>
          <div className={`text-xs text-${sc}-400 font-semibold uppercase`}>Overall Water Quality — {data?.facility_name}</div>
          <div className={`text-3xl font-black text-${sc}-300 mt-1`}>{data?.overall_status}</div>
          <div className="text-xs text-slate-400 mt-1">Last tested: {data?.last_tested?new Date(data.last_tested).toLocaleTimeString():'-'}</div>
        </div>
        {data?.overall_status==='NORMAL'?<CheckCircle2 className="w-12 h-12 text-emerald-400"/>:<AlertTriangle className={`w-12 h-12 text-${sc}-400`}/>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parameter Cards */}
        <div className="grid grid-cols-1 gap-3">
          {data?.readings?.map((r:any)=>{
            const c = statusColor(r.status);
            return (
              <div key={r.parameter} className={`p-4 rounded-xl border bg-${c}-500/5 border-${c}-500/20`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className={`text-sm font-bold text-${c}-300`}>{r.parameter}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Normal: {r.normal_range}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-white">{r.value}<span className="text-xs text-slate-400 ml-1">{r.unit}</span></div>
                    <div className={`text-[10px] px-1.5 py-0.5 rounded bg-${c}-500/20 text-${c}-400 inline-block mt-1`}>{r.status}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Radar */}
        <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a] flex flex-col">
          <h2 className="text-sm font-bold text-white mb-4">Quality Radar Profile</h2>
          <div className="flex-1 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1a233a"/>
                <PolarAngleAxis dataKey="subject" tick={{fill:'#94a3b8',fontSize:11}}/>
                <Radar name="Quality" dataKey="A" stroke={data?.overall_status==='NORMAL'?'#10b981':data?.overall_status==='WARNING'?'#f59e0b':'#f43f5e'} fill={data?.overall_status==='NORMAL'?'#10b981':data?.overall_status==='WARNING'?'#f59e0b':'#f43f5e'} fillOpacity={0.2}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-slate-500 text-center">100 = Within normal range · 60 = Warning · 20 = Critical</div>
        </div>
      </div>
    </div>
  );
}
