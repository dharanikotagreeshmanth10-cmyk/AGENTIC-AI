'use client';
import React, { useEffect, useState } from 'react';
import { CloudRain, RefreshCw, AlertTriangle, Building2 } from 'lucide-react';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const FACILITIES = ['BUILDING-A','BUILDING-B','BUILDING-C','BUILDING-D','BUILDING-E'];
const FN: Record<string,string> = {'BUILDING-A':'Admin Block','BUILDING-B':'Science Block','BUILDING-C':'Engineering Lab','BUILDING-D':'Arts & Media','BUILDING-E':'Lecture Hall Complex'};

export default function RainwaterPage() {
  const [fid, setFid] = useState('BUILDING-E');
  const [rainfall, setRainfall] = useState(85);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const load = async () => {
    try { setLoading(true); setError(null); const d = await api.getWaterRainwater(fid, rainfall); setData(d); }
    catch(e:any) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[fid, rainfall]);

  const chartData = data ? [
    {name:'Gross Collected', value: data.outputs?.gross_collection_liters||0, fill:'#3b82f6'},
    {name:'Usable Water', value: data.outputs?.usable_water_liters||0, fill:'#10b981'},
    {name:'Storage Req.', value: data.outputs?.storage_required_liters||0, fill:'#8b5cf6'},
    {name:'Overflow', value: data.outputs?.overflow_liters||0, fill:'#f59e0b'},
  ] : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1a233a] pb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2"><CloudRain className="text-blue-400"/>Rainwater Harvesting Optimizer</h1>
          <p className="text-sm text-slate-400 mt-1">Calculate estimated rainwater collection based on rainfall, roof area, runoff coefficient, and storage capacity</p>
          <span className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">⚠ Simulated Data</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Building2 className="text-slate-400 w-4 h-4"/>
          <select value={fid} onChange={e=>setFid(e.target.value)} className="px-3 py-2 rounded-lg bg-[#0d1427] border border-[#1a233a] text-sm text-slate-200 focus:outline-none focus:border-cyan-400">
            {FACILITIES.map(f=><option key={f} value={f}>{FN[f]}</option>)}
          </select>
        </div>
      </div>

      {/* Controls */}
      <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a]">
        <h2 className="text-sm font-bold text-white mb-4">Simulation Parameters</h2>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <label className="text-xs text-slate-400 block mb-1">Monthly Rainfall (mm): <span className="text-cyan-300 font-bold">{rainfall} mm</span></label>
            <input type="range" min={10} max={300} value={rainfall} onChange={e=>setRainfall(Number(e.target.value))} className="w-full accent-cyan-400"/>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1"><span>10mm (Dry)</span><span>300mm (Monsoon)</span></div>
          </div>
          <div className="text-xs text-slate-400 space-y-1">
            <div>Roof Area: <span className="text-white font-semibold">{data?.inputs?.roof_area_m2} m²</span></div>
            <div>Runoff Coefficient: <span className="text-white font-semibold">{data?.inputs?.runoff_coefficient}</span></div>
            <div>System Efficiency: <span className="text-white font-semibold">{((data?.inputs?.system_efficiency||0)*100).toFixed(0)}%</span></div>
          </div>
        </div>
      </div>

      {loading && <div className="flex items-center justify-center h-24"><RefreshCw className="w-6 h-6 text-cyan-400 animate-spin"/></div>}
      {error && <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{error}</div>}

      {data && !loading && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {label:'Gross Collection', value:`${(data.outputs?.gross_collection_liters/1000||0).toFixed(1)} kL`, color:'blue'},
              {label:'Usable Water', value:`${(data.outputs?.usable_water_liters/1000||0).toFixed(1)} kL`, color:'emerald'},
              {label:'Storage Required', value:`${(data.outputs?.storage_required_liters/1000||0).toFixed(1)} kL`, color:'purple'},
              {label:'Potential Savings', value:`₹${(data.outputs?.potential_savings_inr||0).toFixed(0)}`, color:'cyan'},
            ].map(c=>(
              <div key={c.label} className={`p-5 rounded-xl bg-gradient-to-br from-[#0d1427] to-[#111a33] border border-[#1a233a]`}>
                <div className={`text-xs text-${c.color}-400 uppercase font-semibold mb-2`}>{c.label}</div>
                <div className="text-2xl font-black text-white">{c.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a]">
              <h2 className="text-sm font-bold text-white mb-4">Water Volume Breakdown</h2>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#64748b" tick={{fill:'#64748b',fontSize:10}}/>
                    <YAxis stroke="#64748b" tick={{fill:'#64748b',fontSize:10}}/>
                    <Tooltip contentStyle={{backgroundColor:'#111a33',borderColor:'#1a233a',borderRadius:'8px'}} formatter={(v:any)=>[`${(v/1000).toFixed(1)} kL`,'']}/>
                    <Bar dataKey="value" radius={4}>
                      {chartData.map((e,i)=><Cell key={i} fill={e.fill}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a] space-y-4">
              <h2 className="text-sm font-bold text-white">Additional Metrics</h2>
              <div className="space-y-3 text-xs">
                {[
                  {label:'CO₂ Avoided', value:`${data.outputs?.co2_avoided_kg} kg`},
                  {label:'Savings (USD)', value:`$${data.outputs?.potential_savings_usd}`},
                  {label:'Storage Overflow', value:`${(data.outputs?.overflow_liters/1000||0).toFixed(1)} kL`},
                  {label:'Storage Capacity', value:`${(data.inputs?.storage_capacity_liters/1000||0).toFixed(0)} kL`},
                ].map(r=>(
                  <div key={r.label} className="flex justify-between p-2.5 rounded bg-[#111a33]">
                    <span className="text-slate-400">{r.label}</span>
                    <span className="text-white font-semibold">{r.value}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200">
                <div className="font-bold mb-1">AI Recommendation</div>
                <p>{data.recommendation}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
