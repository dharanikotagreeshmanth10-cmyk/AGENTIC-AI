'use client';
import React, { useEffect, useState } from 'react';
import { Beaker, RefreshCw, AlertTriangle, Building2, ArrowRight, Zap, Droplets, Users } from 'lucide-react';
import { api } from '@/lib/api';

const FACILITIES = ['BUILDING-A','BUILDING-B','BUILDING-C','BUILDING-D','BUILDING-E'];
const FN: Record<string,string> = {'BUILDING-A':'Admin Block','BUILDING-B':'Science Block','BUILDING-C':'Engineering Lab','BUILDING-D':'Arts & Media','BUILDING-E':'Lecture Hall Complex'};

export default function CrossResourcePage() {
  const [fid, setFid] = useState('BUILDING-B');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  const load = async (f:string) => {
    try { setLoading(true); setError(null); const d = await api.getWaterCrossResource(f); setData(d); }
    catch(e:any) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(()=>{ load(fid); },[fid]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><RefreshCw className="w-10 h-10 text-cyan-400 animate-spin"/></div>;
  if (error) return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center"><AlertTriangle className="w-12 h-12 text-rose-400"/><p className="text-slate-400 text-sm">{error}</p><button onClick={()=>load(fid)} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm">Retry</button></div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1a233a] pb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2"><Beaker className="text-indigo-400"/>Cross-Resource Optimization</h1>
          <p className="text-sm text-slate-400 mt-1">Analyze relationships between water, energy, occupancy, and weather for coordinated recommendations</p>
          <span className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">⚠ Simulated Data</span>
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="text-slate-400 w-4 h-4"/>
          <select value={fid} onChange={e=>setFid(e.target.value)} className="px-3 py-2 rounded-lg bg-[#0d1427] border border-[#1a233a] text-sm text-slate-200 focus:outline-none focus:border-cyan-400">
            {FACILITIES.map(f=><option key={f} value={f}>{FN[f]}</option>)}
          </select>
        </div>
      </div>

      {/* Potential savings summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-gradient-to-br from-blue-500/10 to-[#0d1427] border border-blue-500/20 text-center">
          <div className="text-xs text-blue-400 uppercase font-semibold mb-2 flex items-center justify-center gap-1"><Droplets className="w-3 h-3"/>Water Savings Potential</div>
          <div className="text-4xl font-black text-blue-300">{data?.total_potential_water_saving_pct}%</div>
          <div className="text-xs text-blue-400 mt-1">via coordinated optimization</div>
        </div>
        <div className="p-5 rounded-xl bg-gradient-to-br from-amber-500/10 to-[#0d1427] border border-amber-500/20 text-center">
          <div className="text-xs text-amber-400 uppercase font-semibold mb-2 flex items-center justify-center gap-1"><Zap className="w-3 h-3"/>Energy Savings Potential</div>
          <div className="text-4xl font-black text-amber-300">{data?.total_potential_energy_saving_pct}%</div>
          <div className="text-xs text-amber-400 mt-1">via demand response</div>
        </div>
      </div>

      {/* Causal Chain Insights */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white">Resource Dependency Chains</h2>
        {data?.cross_resource_insights?.map((ins:any, i:number)=>(
          <div key={i} className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a]">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {ins.chain.split('->').map((step:string, j:number, arr:string[])=>(
                <React.Fragment key={j}>
                  <span className="px-2 py-1 rounded bg-[#1a233a] text-xs text-slate-300">{step.trim()}</span>
                  {j<arr.length-1&&<ArrowRight className="w-3 h-3 text-cyan-400 flex-shrink-0"/>}
                </React.Fragment>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
              {Object.entries(ins).filter(([k])=>!['chain','insight'].includes(k)).map(([k,v]:any)=>(
                <div key={k} className="p-2 rounded bg-[#111a33] text-xs">
                  <div className="text-slate-400 capitalize mb-0.5">{k.replace(/_/g,' ')}</div>
                  <div className="font-mono text-cyan-300 font-semibold">{typeof v==='number'?v.toFixed?.(1):v}</div>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200">{ins.insight}</div>
          </div>
        ))}
      </div>

      {/* Coordinated Recommendations */}
      <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a]">
        <h2 className="text-sm font-bold text-white mb-4">Coordinated Recommendations</h2>
        <div className="space-y-2">
          {data?.coordinated_recommendations?.map((r:any,i:number)=>(
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#111a33] border border-[#1a233a] text-xs">
              <div className="flex items-center gap-3">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${r.priority==='HIGH'?'bg-rose-500/20 text-rose-400':'bg-amber-500/20 text-amber-400'}`}>{r.priority}</span>
                <span className="text-slate-200">{r.title}</span>
              </div>
              <div className="flex gap-3 ml-4 flex-shrink-0">
                <span className="text-blue-400 font-semibold"><Droplets className="w-3 h-3 inline mr-0.5"/>{r.water_impact}</span>
                <span className="text-amber-400 font-semibold"><Zap className="w-3 h-3 inline mr-0.5"/>{r.energy_impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
