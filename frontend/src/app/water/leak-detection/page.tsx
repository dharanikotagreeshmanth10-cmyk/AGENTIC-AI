'use client';
import React, { useEffect, useState } from 'react';
import { AlertOctagon, RefreshCw, AlertTriangle, Building2, Droplets, Activity, Gauge, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';

const FACILITIES = ['BUILDING-A','BUILDING-B','BUILDING-C','BUILDING-D','BUILDING-E'];
const FN: Record<string,string> = {'BUILDING-A':'Admin Block','BUILDING-B':'Science Block','BUILDING-C':'Engineering Lab','BUILDING-D':'Arts & Media','BUILDING-E':'Lecture Hall Complex'};

export default function LeakDetectionPage() {
  const [fid, setFid] = useState('BUILDING-B');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [allData, setAllData] = useState<any[]>([]);

  const load = async (f:string) => {
    try {
      setLoading(true); setError(null);
      const [d, all] = await Promise.all([
        api.getWaterLeakDetection(f),
        Promise.all(FACILITIES.map(x=>api.getWaterLeakDetection(x)))
      ]);
      setData(d); setAllData(all);
    } catch(e:any) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(()=>{ load(fid); },[fid]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><RefreshCw className="w-10 h-10 text-cyan-400 animate-spin"/></div>;
  if (error) return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center"><AlertTriangle className="w-12 h-12 text-rose-400"/><p className="text-slate-400 text-sm max-w-md">{error}</p><button onClick={()=>load(fid)} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm">Retry</button></div>;

  const prob = data?.leak_probability || 0;
  const statusColor = data?.status==='CRITICAL'?'rose':data?.status==='WARNING'?'amber':'emerald';
  const chartData = [{name:'Leak Risk', value: Math.round(prob*100), fill: prob>0.7?'#f43f5e':prob>0.35?'#f59e0b':'#10b981'}];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1a233a] pb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2"><AlertOctagon className="text-rose-400"/>AI Predictive Leak Detection</h1>
          <p className="text-sm text-slate-400 mt-1">Multi-telemetry leak probability engine — flow, pressure, tank level, occupancy, time-of-day</p>
          <span className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">⚠ Simulated Data</span>
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="text-slate-400 w-4 h-4"/>
          <select value={fid} onChange={e=>setFid(e.target.value)} className="px-3 py-2 rounded-lg bg-[#0d1427] border border-[#1a233a] text-sm text-slate-200 focus:outline-none focus:border-cyan-400">
            {FACILITIES.map(f=><option key={f} value={f}>{FN[f]}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gauge */}
        <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a] flex flex-col items-center">
          <h2 className="text-sm font-bold text-white mb-2">Leak Probability</h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="60%" outerRadius="100%" data={chartData} startAngle={90} endAngle={-270}>
                <RadialBar background dataKey="value" cornerRadius={8}/>
                <Tooltip contentStyle={{backgroundColor:'#111a33',borderColor:'#1a233a',borderRadius:'8px'}}/>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className={`text-4xl font-black text-${statusColor}-400 -mt-10`}>{Math.round(prob*100)}%</div>
          <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold bg-${statusColor}-500/20 text-${statusColor}-400 border border-${statusColor}-500/30`}>{data?.status}</div>
          <div className="mt-2 text-[10px] text-slate-400">Severity: {data?.severity}</div>
          <div className="mt-1 text-[10px] text-slate-400">Confidence: {Math.round((data?.confidence||0)*100)}%</div>
        </div>

        {/* Telemetry Inputs */}
        <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a]">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-cyan-400"/>Telemetry Inputs</h2>
          <div className="space-y-3">
            {Object.entries(data?.telemetry_inputs||{}).map(([k,v]:any)=>(
              <div key={k} className="flex justify-between items-center p-2 rounded bg-[#111a33] text-xs">
                <span className="text-slate-400 capitalize">{k.replace(/_/g,' ')}</span>
                <span className="font-mono text-cyan-300 font-semibold">{typeof v==='number'?v.toFixed?.(2):v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Impact + Action */}
        <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a] space-y-4">
          <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><Droplets className="w-4 h-4 text-blue-400"/>Water Loss Impact</h2>
          <div className="space-y-2">
            {[
              {label:'Loss Rate', value:`${data?.estimated_water_loss_lpm} L/min`},
              {label:'Daily Loss', value:`${data?.estimated_daily_loss_kl} kL/day`},
              {label:'Monthly Loss', value:`${(data?.estimated_monthly_loss_liters||0).toLocaleString()} L`},
            ].map(i=>(
              <div key={i.label} className="flex justify-between p-2 rounded bg-[#111a33] text-xs">
                <span className="text-slate-400">{i.label}</span>
                <span className={`font-bold ${prob>0.5?'text-rose-300':'text-slate-200'}`}>{i.value}</span>
              </div>
            ))}
          </div>
          <div className={`p-3 rounded-lg bg-${statusColor}-500/10 border border-${statusColor}-500/20 text-xs text-${statusColor}-200`}>
            <div className="font-bold mb-1">Recommended Action</div>
            <p>{data?.recommended_action}</p>
          </div>
        </div>
      </div>

      {/* All Facilities Summary */}
      <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a]">
        <h2 className="text-sm font-bold text-white mb-4">All Facilities — Leak Risk Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {allData.map((d,i)=>{
            const p = d?.leak_probability||0;
            const c = d?.status==='CRITICAL'?'rose':d?.status==='WARNING'?'amber':'emerald';
            return (
              <button key={i} onClick={()=>setFid(FACILITIES[i])} className={`p-3 rounded-lg border text-xs text-left transition-all ${fid===FACILITIES[i]?'border-cyan-400 bg-[#152445]':'border-[#1a233a] bg-[#111a33] hover:border-cyan-500/40'}`}>
                <div className="font-semibold text-white text-xs mb-1">{FN[FACILITIES[i]]}</div>
                <div className={`text-2xl font-black text-${c}-400`}>{Math.round(p*100)}%</div>
                <div className={`text-[10px] mt-1 px-1.5 py-0.5 rounded inline-block bg-${c}-500/20 text-${c}-400`}>{d?.status}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
