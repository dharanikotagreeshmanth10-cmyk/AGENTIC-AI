'use client';
import React, { useEffect, useState } from 'react';
import { Recycle, RefreshCw, AlertTriangle, Building2 } from 'lucide-react';
import { api } from '@/lib/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const FACILITIES = ['BUILDING-A','BUILDING-B','BUILDING-C','BUILDING-D','BUILDING-E'];
const FN: Record<string,string> = {'BUILDING-A':'Admin Block','BUILDING-B':'Science Block','BUILDING-C':'Engineering Lab','BUILDING-D':'Arts & Media','BUILDING-E':'Lecture Hall Complex'};
const COLORS = ['#22d3ee','#10b981','#8b5cf6','#f59e0b'];

export default function GreywaterPage() {
  const [fid, setFid] = useState('BUILDING-B');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  const load = async (f:string) => {
    try { setLoading(true); setError(null); const d = await api.getWaterGreywater(f); setData(d); }
    catch(e:any) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(()=>{ load(fid); },[fid]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><RefreshCw className="w-10 h-10 text-cyan-400 animate-spin"/></div>;
  if (error) return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center"><AlertTriangle className="w-12 h-12 text-rose-400"/><p className="text-slate-400 text-sm">{error}</p><button onClick={()=>load(fid)} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm">Retry</button></div>;

  const pieData = Object.entries(data?.source_breakdown||{}).map(([k,v]:any,i)=>({name:k.replace(/_/g,' '),value:v.generated_liters, fill:COLORS[i]}));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1a233a] pb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2"><Recycle className="text-emerald-400"/>Greywater Reuse Optimizer</h1>
          <p className="text-sm text-slate-400 mt-1">Estimate reusable water from bathrooms, wash basins, showers, and other sources</p>
          <span className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">⚠ Simulated Data</span>
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="text-slate-400 w-4 h-4"/>
          <select value={fid} onChange={e=>setFid(e.target.value)} className="px-3 py-2 rounded-lg bg-[#0d1427] border border-[#1a233a] text-sm text-slate-200 focus:outline-none focus:border-cyan-400">
            {FACILITIES.map(f=><option key={f} value={f}>{FN[f]}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {label:'Total Greywater', value:`${(data?.summary?.total_greywater_liters/1000||0).toFixed(1)} kL/day`, color:'blue'},
          {label:'Reusable Water', value:`${(data?.summary?.total_reusable_liters/1000||0).toFixed(1)} kL/day`, color:'emerald'},
          {label:'Fresh Water Reduction', value:`${data?.summary?.fresh_water_reduction_pct}%`, color:'cyan'},
          {label:'Monthly Savings', value:`₹${(data?.summary?.potential_savings_inr_per_month||0).toFixed(0)}`, color:'amber'},
        ].map(c=>(
          <div key={c.label} className="p-5 rounded-xl bg-gradient-to-br from-[#0d1427] to-[#111a33] border border-[#1a233a]">
            <div className={`text-xs text-${c.color}-400 uppercase font-semibold mb-2`}>{c.label}</div>
            <div className="text-2xl font-black text-white">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a]">
          <h2 className="text-sm font-bold text-white mb-4">Greywater by Source</h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((e,i)=><Cell key={i} fill={e.fill}/>)}
                </Pie>
                <Tooltip contentStyle={{backgroundColor:'#111a33',borderColor:'#1a233a',borderRadius:'8px'}} formatter={(v:any)=>[`${v} L`,'']}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a]">
          <h2 className="text-sm font-bold text-white mb-4">Source Breakdown (Occupancy: {data?.occupancy})</h2>
          <div className="space-y-3">
            {Object.entries(data?.source_breakdown||{}).map(([k,v]:any,i)=>(
              <div key={k} className="p-3 rounded-lg bg-[#111a33] border border-[#1a233a]">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-white capitalize">{k.replace(/_/g,' ')}</span>
                  <span className="text-xs text-slate-400">{v.generated_liters} L generated</span>
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-emerald-400">Reusable: {v.reusable_liters} L</span>
                  <span className="text-slate-400">{((v.reusable_liters/v.generated_liters)*100).toFixed(0)}% recovery</span>
                </div>
                <div className="w-full bg-[#1a233a] rounded-full h-1.5">
                  <div className="h-1.5 rounded-full" style={{width:`${(v.reusable_liters/v.generated_liters)*100}%`,backgroundColor:COLORS[i]}}/>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200">
            <div className="font-bold mb-1">Recommendation</div>
            <p>{data?.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
